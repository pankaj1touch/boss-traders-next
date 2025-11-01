const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { createSlug } = require('../utils/slugHelper');
require('dotenv').config();

const finalBlogs = [
  {
    title: "Technical Analysis Basics: Chart Patterns Every Trader Should Know",
    excerpt: "Master the essential chart patterns that signal potential trading opportunities and market reversals.",
    content: `
      <h2>Introduction to Chart Patterns</h2>
      <p>Technical analysis relies heavily on recognizing patterns in price charts. These patterns provide insights into market sentiment and potential future price movements.</p>
      
      <h3>Reversal Patterns</h3>
      
      <h4>Head and Shoulders</h4>
      <p>This pattern consists of three peaks, with the middle peak (head) being the highest. It signals a potential bearish reversal when it appears after an uptrend.</p>
      
      <h4>Double Top and Double Bottom</h4>
      <p>Double tops form after uptrends and signal bearish reversals, while double bottoms form after downtrends and signal bullish reversals.</p>
      
      <h3>Continuation Patterns</h3>
      
      <h4>Flags and Pennants</h4>
      <p>These short-term consolidation patterns typically occur after strong price moves and usually resolve in the direction of the prior trend.</p>
      
      <h4>Triangles</h4>
      <p>Triangles come in three types: ascending, descending, and symmetrical. They represent consolidation before the next significant move.</p>
      
      <h3>Pattern Recognition Tips</h3>
      <ul>
        <li>Look for clear, well-defined patterns</li>
        <li>Wait for pattern completion before acting</li>
        <li>Consider volume confirmation</li>
        <li>Use multiple timeframes for validation</li>
        <li>Practice with paper trading first</li>
      </ul>
    `,
    featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3",
    category: "business",
    tags: ["technical-analysis", "chart-patterns", "trading", "reversal-patterns"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Chart Patterns Trading Guide - Technical Analysis Basics",
    seoDescription: "Learn essential chart patterns for trading success. Master head and shoulders, double tops, flags, and triangles for better market analysis."
  },
  {
    title: "Fundamental Analysis for Traders: Reading Economic Indicators",
    excerpt: "Learn how economic indicators impact markets and how to use fundamental analysis for better trading decisions.",
    content: `
      <h2>Understanding Fundamental Analysis</h2>
      <p>Fundamental analysis involves studying economic, financial, and other qualitative and quantitative factors to determine the intrinsic value of assets.</p>
      
      <h3>Key Economic Indicators</h3>
      
      <h4>GDP (Gross Domestic Product)</h4>
      <p>GDP measures a country's economic output and growth. Higher GDP growth typically indicates a stronger economy and can boost currency values.</p>
      
      <h4>Inflation Data</h4>
      <p>Inflation measures price increases over time. Central banks use this data to set interest rates, which directly impact currency values and stock markets.</p>
      
      <h4>Employment Reports</h4>
      <p>Unemployment rates and job creation numbers provide insights into economic health and consumer spending power.</p>
      
      <h4>Central Bank Policies</h4>
      <p>Interest rate decisions and monetary policy statements from central banks have significant impacts on market movements.</p>
      
      <h3>How to Use Fundamental Analysis</h3>
      <ul>
        <li>Follow economic calendars for important releases</li>
        <li>Understand market expectations vs actual results</li>
        <li>Look for trends over multiple quarters</li>
        <li>Consider intermarket relationships</li>
        <li>Combine with technical analysis for better timing</li>
      </ul>
      
      <p>Successful trading often involves combining technical and fundamental analysis for more comprehensive market understanding.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3",
    category: "business",
    tags: ["fundamental-analysis", "economic-indicators", "trading", "gdp", "inflation"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Fundamental Analysis Trading - Economic Indicators Guide",
    seoDescription: "Master fundamental analysis for trading. Learn to read GDP, inflation, employment data, and central bank policies for better market decisions."
  }
];

async function addFinalBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ roles: { $in: ['admin'] } });
    if (!adminUser) {
      console.error('No admin user found.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.name}`);

    const existingTitles = await Blog.find({}, 'title');
    const existingTitleSet = new Set(existingTitles.map(b => b.title));

    let createdCount = 0;
    for (const blogData of finalBlogs) {
      if (existingTitleSet.has(blogData.title)) {
        console.log(`Skipping existing blog: ${blogData.title}`);
        continue;
      }

      const slug = createSlug(blogData.title);
      
      const blog = new Blog({
        ...blogData,
        slug,
        author: adminUser._id,
        publishedAt: blogData.publishStatus === 'published' ? new Date() : null,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 50) + 5,
      });

      await blog.save();
      console.log(`Created blog: ${blogData.title}`);
      createdCount++;
    }

    console.log('✅ Final blogs added successfully!');
    console.log(`📊 Created ${createdCount} additional blogs`);
    
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ publishStatus: 'published' });
    
    console.log('\n📈 Final Blog Statistics:');
    console.log(`Total blogs: ${totalBlogs}`);
    console.log(`Published blogs: ${publishedBlogs}`);

  } catch (error) {
    console.error('Error adding final blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addFinalBlogs();
