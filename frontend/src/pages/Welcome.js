import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChartLine, FaPiggyBank, FaBullseye, FaShieldAlt } from 'react-icons/fa';

const Welcome = () => {
  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Basic expense tracking',
        'Monthly budget planning',
        'Simple savings goals',
        'Basic financial reports'
      ],
      buttonText: 'Get Started',
      buttonLink: '/register'
    },
    {
      name: 'Pro',
      price: '$9.99',
      features: [
        'Advanced expense tracking',
        'Custom budget categories',
        'Multiple savings goals',
        'Detailed financial reports',
        'Bill reminders',
        'Priority support'
      ],
      buttonText: 'Upgrade to Pro',
      buttonLink: '/register?plan=pro'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'API access'
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact'
    }
  ];

  const features = [
    {
      icon: <FaChartLine className="text-4xl text-blue-500" />,
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns and financial health with our advanced analytics tools.'
    },
    {
      icon: <FaPiggyBank className="text-4xl text-green-500" />,
      title: 'Savings Goals',
      description: 'Set and track your savings goals with our intuitive goal-setting tools and progress tracking.'
    },
    {
      icon: <FaBullseye className="text-4xl text-purple-500" />,
      title: 'Budget Planning',
      description: 'Create and manage your budgets with our smart planning tools that adapt to your spending habits.'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-red-500" />,
      title: 'Secure & Private',
      description: 'Your financial data is protected with bank-level security and encryption.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">Smart Budget Genius</h1>
            <p className="text-xl mb-8">Take control of your finances with our intelligent budgeting and tracking tools</p>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition duration-300"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-lg text-center"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}</div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.buttonLink}
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">About Smart Budget Genius</h2>
            <p className="text-lg text-gray-600 mb-6">
              Smart Budget Genius is your personal financial companion, designed to help you make smarter decisions with your money. 
              Our platform combines cutting-edge technology with proven financial principles to provide you with the tools and insights 
              you need to achieve your financial goals.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Whether you're just starting your financial journey or looking to optimize your existing budget, 
              our comprehensive suite of tools and features will help you track expenses, set savings goals, 
              and make informed financial decisions.
            </p>
            <p className="text-lg text-gray-600">
              Join thousands of users who have already taken control of their finances with Smart Budget Genius.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome; 