import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🥩',
      title: 'Prime Cuts',
      description: 'We serve only the finest USDA Prime beef, aged to perfection and grilled to your specification',
      gradient: 'from-red-500 to-red-700',
    },
    {
      icon: '🔥',
      title: 'Expert Grilling',
      description: 'Our master grill chefs use traditional techniques to bring out the best flavors in every steak',
      gradient: 'from-orange-500 to-amber-600',
    },
    {
      icon: '🏡',
      title: 'Cozy Atmosphere',
      description: 'Enjoy your meal in our warm, rustic dining room that feels just like home',
      gradient: 'from-amber-600 to-yellow-700',
    },
  ];

  const stats = [
    { value: '25+', label: 'Years Serving', icon: '⭐' },
    { value: '10,000+', label: 'Steaks Grilled', icon: '🥩' },
    { value: '4.9/5', label: 'Customer Rating', icon: '💯' },
    { value: 'Local', label: 'Family Owned', icon: '🏡' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Steakhouse Image */}
      <div className="hero min-h-screen relative overflow-hidden">
        {/* Hero Background Image from public folder */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/steakhouse-hero.png)' }}
        ></div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[url(data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E)] opacity-10"></div>

        <div className="hero-content text-center text-neutral-content relative z-10 px-4">
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="inline-block p-6 rounded-full bg-white/10 backdrop-blur-sm mb-4 animate-float">
                <span className="text-7xl">🔥</span>
              </div>
            </motion.div>

            <motion.h1
              className="mb-6 text-5xl md:text-7xl font-extrabold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-amber-200 via-orange-100 to-red-200 bg-clip-text text-transparent drop-shadow-lg">
                {t('home.title')}
              </span>
            </motion.h1>

            <motion.p
              className="mb-4 text-2xl md:text-3xl text-amber-100 font-bold max-w-3xl mx-auto drop-shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Where Every Steak is Grilled to Perfection
            </motion.p>

            <motion.p
              className="mb-8 text-lg md:text-xl text-amber-50/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your neighborhood steakhouse serving premium cuts, craft sides, and classic comfort food since 1998
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/menu"
                className="btn btn-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none text-lg px-8 shadow-2xl hover-lift"
              >
                View Our Steaks
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/reservations"
                className="btn btn-lg btn-outline text-white border-amber-300 border-2 hover:bg-amber-300 hover:text-stone-900 text-lg px-8 hover-lift"
              >
                Reserve a Table
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 text-amber-200/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-base-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-700 bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-base-content/70 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xs mx-auto">
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              The Jr's Grill Experience
            </span>
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            What makes us your favorite neighborhood steakhouse
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card bg-base-100 shadow-xl hover-lift border-2 border-transparent hover:border-amber-500/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="card-body items-center text-center p-8">
                <motion.div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-5xl">{feature.icon}</span>
                </motion.div>
                <h2 className="card-title text-2xl mb-3">{feature.title}</h2>
                <p className="text-base-content/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-red-900 via-amber-900 to-stone-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Hungry for a Great Steak?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Visit us tonight and taste why locals have made Jr's Grill their go-to steakhouse for over 25 years
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/menu"
                className="btn btn-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-none px-12 shadow-xl text-lg"
              >
                Order Now 🥩
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
