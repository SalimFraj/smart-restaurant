import Groq from 'groq-sdk';

// Lazy initialization of Groq client
let groq = null;

const getGroqClient = () => {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your-groq-api-key-here') {
      console.warn('⚠️  GROQ_API_KEY is not set. AI features will not work.');
      return null;
    }
    try {
      groq = new Groq({
        apiKey: apiKey
      });
    } catch (error) {
      console.error('Failed to initialize Groq client:', error);
      return null;
    }
  }
  return groq;
};

// Generate likely model id variants from a human-friendly model name.
const generateModelCandidates = (modelName) => {
  if (!modelName) return [];
  const candidates = new Set();
  const original = String(modelName).trim();
  candidates.add(original);

  const lower = original.toLowerCase();
  candidates.add(lower);

  // replace spaces with dashes
  candidates.add(lower.replace(/\s+/g, '-'));

  // replace spaces and dots with dashes (e.g. "3.1" -> "3-1")
  candidates.add(lower.replace(/[\.\s]+/g, '-'));

  // common variant: remove dots but keep dash between version and size
  candidates.add(lower.replace(/\./g, '').replace(/\s+/g, '-'));

  // shorter variants
  candidates.add(lower.replace(/[^a-z0-9-]/g, ''));

  return Array.from(candidates);
};

// Try creating a completion using multiple candidate model ids until one works.
// If all fail, query Groq for available models and try each until one works.
const createCompletionWithModelFallback = async (client, createParams, modelEnv) => {
  const candidates = generateModelCandidates(modelEnv);
  if (!candidates || candidates.length === 0) {
    console.warn('[Groq Fallback] Candidate model id list is empty!');
  } else {
    console.warn('[Groq Fallback] Candidate model id list:', candidates);
  }
  let lastError = null;
  let triedAny = false;
  for (const candidate of candidates) {
    console.warn(`[Groq Fallback] Trying candidate model id: ${candidate}`);
    triedAny = true;
    try {
      const params = { ...createParams, model: candidate };
      const result = await client.chat.completions.create(params);
      console.warn(`[Groq Fallback] Success with candidate: ${candidate}`);
      return result;
    } catch (err) {
      lastError = err;
      const isModelNotFound = err?.code === 'model_not_found' || (err?.response && err.response.status === 404) || /model not found/i.test(String(err?.message || ''));
      if (!isModelNotFound) throw err;
      console.warn(`[Groq Fallback] Model "${candidate}" not found or inaccessible, trying next candidate...`);
    }
  }
  // If all candidates failed, try all available models from Groq
  try {
    // Always attempt model listing if no candidate worked or none were tried
    if (client.models && typeof client.models.list === 'function') {
      console.warn('[Groq Fallback] Attempting to list Groq models for fallback...');
      let modelList;
      try {
        modelList = await client.models.list();
        console.warn('[Groq Fallback] Groq models.list() raw result:', modelList);
      } catch (listErr) {
        console.error('[Groq Fallback] Groq models.list() threw error:', listErr);
        modelList = null;
      }
      const availableModels = modelList && Array.isArray(modelList.data) ? modelList.data : [];
      const modelIds = availableModels.map(m => m.id || m.name).filter(Boolean);
      console.warn('[Groq Fallback] Groq available model ids:', modelIds);
      if (modelIds.length === 0) {
        console.warn('[Groq Fallback] No available Groq model ids found.');
      }
      for (const modelId of modelIds) {
        console.warn(`[Groq Fallback] Trying Groq available model: ${modelId}`);
        try {
          const params = { ...createParams, model: modelId };
          const result = await client.chat.completions.create(params);
          console.warn(`[Groq Fallback] Success with Groq available model: ${modelId}`);
          return result;
        } catch (err) {
          const isModelNotFound = err?.code === 'model_not_found' || (err?.response && err.response.status === 404) || /model not found/i.test(String(err?.message || ''));
          if (!isModelNotFound) throw err;
          console.warn(`[Groq Fallback] Model "${modelId}" not found or inaccessible, trying next available model...`);
        }
      }
    } else {
      console.warn('[Groq Fallback] Groq SDK does not support models.list() or models property missing.');
    }
  } catch (listErr) {
    console.error('Failed to list Groq models for fallback:', listErr);
  }
  // all candidates and available models failed
  throw lastError || new Error('No model candidates or available models succeeded');
};

export const getRecommendations = async (userHistory, menuItems) => {
  try {
    const groqClient = getGroqClient();
    if (!groqClient) return [];
    const model = process.env.GROQ_MODEL;
    if (!model) {
      console.warn('⚠️  GROQ_MODEL is not set. Set GROQ_MODEL in .env to a model id you have access to.');
      return [];
    }
    const historyText = userHistory.length > 0
      ? `User's past orders: ${userHistory.map(h => h.name).join(', ')}`
      : 'No order history available.';

    const menuText = menuItems.map(item => 
      `${item.name} ($${item.price}) - ${item.description} - Categories: ${item.category} - Dietary: ${item.dietary.vegan ? 'Vegan' : ''} ${item.dietary.vegetarian ? 'Vegetarian' : ''} ${item.dietary.glutenFree ? 'Gluten-free' : ''} ${item.dietary.spicy ? 'Spicy' : ''}`
    ).join('\n');

    const prompt = `You are a restaurant recommendation assistant. Based on the user's order history and current menu, recommend 5 dishes that the user would likely enjoy.

${historyText}

Current menu items:
${menuText}

Provide exactly 5 recommendations as a JSON array of dish names only, no explanations. Format: ["Dish 1", "Dish 2", "Dish 3", "Dish 4", "Dish 5"]`;

    const completion = await createCompletionWithModelFallback(groqClient, {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful restaurant recommendation assistant. Always respond with valid JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    }, model);

    const response = completion.choices[0]?.message?.content || '[]';
    let recommendations = [];
    
    try {
      recommendations = JSON.parse(response);
      if (!Array.isArray(recommendations)) {
        recommendations = [];
      }
    } catch (e) {
      // Fallback: extract dish names from text
      const matches = response.match(/"([^"]+)"/g);
      if (matches) {
        recommendations = matches.map(m => m.replace(/"/g, ''));
      }
    }

    return recommendations.slice(0, 5);
  } catch (error) {
    if (error?.code === 'model_not_found' || (error?.response && error.response.status === 404)) {
      console.error('Groq recommendation error: model not found or inaccessible. Check GROQ_MODEL and your account access.', error);
    } else {
      console.error('Groq recommendation error:', error);
    }
    return [];
  }
};

export const getChatResponse = async (message, menuItems, reservations) => {
  try {
    const groqClient = getGroqClient();
    if (!groqClient) {
      throw new Error('GROQ_API_KEY is not configured. Please set it in your .env file.');
    }
    const model = process.env.GROQ_MODEL;
    if (!model) {
      throw new Error('GROQ_MODEL is not configured. Please set GROQ_MODEL in your .env to a model id you have access to.');
    }
    const menuText = menuItems.map(item => 
      `${item.name} - $${item.price} - ${item.description} - Available: ${item.available ? 'Yes' : 'No'} - Category: ${item.category} - Dietary: ${item.dietary.vegan ? 'Vegan' : ''} ${item.dietary.vegetarian ? 'Vegetarian' : ''} ${item.dietary.glutenFree ? 'Gluten-free' : ''} ${item.dietary.spicy ? 'Spicy' : ''} - Ingredients: ${item.ingredients.join(', ')}`
    ).join('\n');

    const systemPrompt = `You are a helpful restaurant assistant chatbot. You have access to the current menu and can help with:
- Menu items, prices, ingredients, dietary information
- Recommendations based on preferences (vegan, vegetarian, gluten-free, spicy, etc.)
- Reservation information 
- General restaurant questions

Current menu:
${menuText}

Today's reservations: ${reservations.length} reservations scheduled.

Be friendly, concise, and helpful. If asked about something not on the menu, politely say so.`;

    const completion = await createCompletionWithModelFallback(groqClient, {
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true
    }, model);

    return completion;
  } catch (error) {
    if (error?.code === 'model_not_found' || (error?.response && error.response.status === 404)) {
      console.error('Groq chat error: model not found or inaccessible. Check GROQ_MODEL and your account access.', error);
      throw new Error('AI model not found or inaccessible. Set `GROQ_MODEL` to a model you have access to, or check your Groq account permissions.');
    }
    console.error('Groq chat error:', error);
    throw error;
  }
};

export const analyzeSentiment = async (comment) => {
  try {
    const groqClient = getGroqClient();
    if (!groqClient) {
      return { sentiment: 'neutral', score: 0 };
    }
    const prompt = `Analyze the sentiment of this restaurant feedback comment. Respond with ONLY a JSON object: {"sentiment": "positive" | "negative" | "neutral", "score": number between -1 and 1}

Comment: "${comment}"`;

    const model = process.env.GROQ_MODEL;
    if (!model) {
      console.warn('⚠️  GROQ_MODEL is not set. Sentiment analysis will use default fallback behavior.');
      return { sentiment: 'neutral', score: 0 };
    }

    const completion = await createCompletionWithModelFallback(groqClient, {
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 50
    }, model);

    const response = completion.choices[0]?.message?.content || '{"sentiment":"neutral","score":0}';
    const result = JSON.parse(response);
    
    return {
      sentiment: result.sentiment || 'neutral',
      score: result.score || 0
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { sentiment: 'neutral', score: 0 };
  }
};

