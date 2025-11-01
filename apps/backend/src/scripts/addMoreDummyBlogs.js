const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { createSlug } = require('../utils/slugHelper');
require('dotenv').config();

const additionalDummyBlogs = [
  {
    title: "Day Trading vs Swing Trading: Which Strategy Fits You?",
    excerpt: "Compare day trading and swing trading strategies to find the best approach for your lifestyle and trading goals.",
    content: `
      <h2>Understanding Different Trading Styles</h2>
      <p>Trading strategies can be broadly categorized into different time frames, each with its own advantages and challenges. Two popular approaches are day trading and swing trading, each suited for different types of traders.</p>
      
      <h3>Day Trading</h3>
      <p>Day trading involves opening and closing positions within the same trading day. This strategy requires constant monitoring of the markets and quick decision-making.</p>
      
      <h4>Advantages of Day Trading:</h4>
      <ul>
        <li>No overnight risk exposure</li>
        <li>Potential for quick profits</li>
        <li>Multiple opportunities per day</li>
        <li>Can profit from both rising and falling markets</li>
      </ul>
      
      <h4>Disadvantages of Day Trading:</h4>
      <ul>
        <li>Requires significant time commitment</li>
        <li>High stress levels</li>
        <li>Transaction costs can eat into profits</li>
        <li>Requires advanced technical analysis skills</li>
      </ul>
      
      <h3>Swing Trading</h3>
      <p>Swing trading involves holding positions for several days to weeks, capturing price swings in trending markets.</p>
      
      <h4>Advantages of Swing Trading:</h4>
      <ul>
        <li>Less time-consuming than day trading</li>
        <li>Lower transaction costs</li>
        <li>More time for analysis and planning</li>
        <li>Suitable for part-time traders</li>
      </ul>
      
      <h4>Disadvantages of Swing Trading:</h4>
      <ul>
        <li>Overnight risk exposure</li>
        <li>Requires larger capital for meaningful profits</li>
        <li>Market gaps can cause unexpected losses</li>
        <li>Longer holding periods mean delayed feedback</li>
      </ul>
      
      <h3>Which Strategy Should You Choose?</h3>
      <p>The choice between day trading and swing trading depends on several factors:</p>
      <ul>
        <li><strong>Time Availability:</strong> Day trading requires full-time commitment</li>
        <li><strong>Risk Tolerance:</strong> Both have risks, but in different ways</li>
        <li><strong>Capital Size:</strong> Day trading can work with smaller accounts</li>
        <li><strong>Personality:</strong> Some prefer quick action, others prefer patience</li>
      </ul>
      
      <p>Consider starting with swing trading if you're new to trading, as it offers more time for learning and analysis.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["day-trading", "swing-trading", "trading-strategies", "timeframes", "beginner"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Day Trading vs Swing Trading - Which Strategy to Choose?",
    seoDescription: "Compare day trading and swing trading strategies. Learn advantages, disadvantages, and which approach fits your trading style and goals."
  },
  {
    title: "Understanding Market Volatility: A Trader's Guide",
    excerpt: "Learn how to navigate different market conditions and use volatility to your advantage in trading decisions.",
    content: `
      <h2>What is Market Volatility?</h2>
      <p>Market volatility refers to the degree of variation in trading prices over time. High volatility means prices change dramatically over short periods, while low volatility indicates relatively stable prices.</p>
      
      <h3>Types of Volatility</h3>
      
      <h4>Historical Volatility</h4>
      <p>Historical volatility looks at past price movements to predict future price behavior. It's calculated using standard deviation of price changes over a specific period.</p>
      
      <h4>Implied Volatility</h4>
      <p>Implied volatility is derived from option prices and reflects market expectations of future volatility. It's forward-looking and often more relevant for traders.</p>
      
      <h3>Factors Affecting Market Volatility</h3>
      
      <h4>Economic Events</h4>
      <ul>
        <li><strong>Interest Rate Changes:</strong> Central bank decisions can cause significant volatility</li>
        <li><strong>Economic Data Releases:</strong> GDP, employment, and inflation reports</li>
        <li><strong>Political Events:</strong> Elections, policy changes, and geopolitical tensions</li>
        <li><strong>Corporate Earnings:</strong> Company-specific news and earnings reports</li>
      </ul>
      
      <h4>Market Sentiment</h4>
      <ul>
        <li>Fear and greed indicators (like VIX)</li>
        <li>Trading volumes and participation</li>
        <li>News sentiment and social media buzz</li>
        <li>Institutional trading patterns</li>
      </ul>
      
      <h3>Measuring Volatility</h3>
      
      <h4>VIX (Volatility Index)</h4>
      <p>The CBOE Volatility Index measures market expectations of volatility over the next 30 days. High VIX values indicate fear and uncertainty.</p>
      
      <h4>Average True Range (ATR)</h4>
      <p>ATR measures average price movement over a specific period, helping traders set appropriate stop-loss levels and position sizes.</p>
      
      <h4>Bollinger Bands</h4>
      <p>These bands expand and contract based on volatility, providing visual representation of price volatility relative to moving averages.</p>
      
      <h3>Trading Strategies for Different Volatility Conditions</h3>
      
      <h4>High Volatility Markets</h4>
      <ul>
        <li><strong>Breakout Trading:</strong> Look for price breakouts from consolidation</li>
        <li><strong>Momentum Strategies:</strong> Follow strong directional moves</li>
        <li><strong>Volatility Expansion Plays:</strong> Trade expecting continued volatility</li>
      </ul>
      
      <h4>Low Volatility Markets</h4>
      <ul>
        <li><strong>Range Trading:</strong> Buy support, sell resistance</li>
        <li><strong>Mean Reversion:</strong> Expect prices to return to average</li>
        <li><strong>Volatility Expansion Trades:</strong> Prepare for potential breakouts</li>
      </ul>
      
      <h3>Risk Management in Volatile Markets</h3>
      
      <h4>Position Sizing</h4>
      <ul>
        <li>Reduce position sizes during high volatility</li>
        <li>Use volatility-based position sizing formulas</li>
        <li>Consider portfolio-level volatility controls</li>
      </ul>
      
      <h4>Stop Loss Adjustments</h4>
      <ul>
        <li>Widen stops during high volatility periods</li>
        <li>Use ATR-based stop losses</li>
        <li>Consider time-based exits for volatile positions</li>
      </ul>
      
      <h4>Portfolio Diversification</h4>
      <ul>
        <li>Spread risk across different asset classes</li>
        <li>Consider volatility-adjusted diversification</li>
        <li>Use correlation analysis to reduce portfolio volatility</li>
      </ul>
      
      <h3>Practical Tips for Volatile Markets</h3>
      <ul>
        <li><strong>Stay Informed:</strong> Keep up with economic calendars and news</li>
        <li><strong>Use Volatility Indicators:</strong> Technical tools can help identify volatile conditions</li>
        <li><strong>Adjust Expectations:</strong> Higher volatility means both higher risks and opportunities</li>
        <li><strong>Practice Patience:</strong> Wait for clear setups rather than forcing trades</li>
        <li><strong>Manage Emotions:</strong> Volatile markets can trigger emotional decisions</li>
      </ul>
      
      <p>Remember, volatility is not inherently good or bad—it's about understanding market conditions and adjusting your strategy accordingly.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["volatility", "market-analysis", "trading", "risk-management", "vix"],
    publishStatus: "published",
    featured: true,
    seoTitle: "Market Volatility Guide - How to Trade in Volatile Markets",
    seoDescription: "Master market volatility trading. Learn to measure volatility, use VIX and ATR indicators, and develop strategies for high and low volatility conditions."
  },
  {
    title: "Building a Profitable Trading System: Step-by-Step Guide",
    excerpt: "Create a systematic approach to trading with rules, risk management, and continuous improvement processes.",
    content: `
      <h2>What Makes a Good Trading System?</h2>
      <p>A trading system is a set of rules and procedures that guide your trading decisions. It removes emotion from trading and provides a framework for consistent decision-making.</p>
      
      <h3>Components of a Trading System</h3>
      
      <h4>1. Entry Rules</h4>
      <p>Clear, specific criteria for when to enter trades. These rules should be objective and measurable.</p>
      <ul>
        <li>Technical indicators and their specific values</li>
        <li>Chart patterns and confirmation requirements</li>
        <li>Fundamental analysis criteria</li>
        <li>Market conditions that must be met</li>
      </ul>
      
      <h4>2. Exit Rules</h4>
      <p>Defined criteria for when to exit trades, both for profits and losses.</p>
      <ul>
        <li>Stop-loss levels and trailing stops</li>
        <li>Profit-taking targets</li>
        <li>Time-based exits</li>
        <li>Conditional exits based on market changes</li>
      </ul>
      
      <h4>3. Position Sizing Rules</h4>
      <p>How much capital to risk on each trade based on your risk tolerance and account size.</p>
      
      <h4>4. Risk Management Rules</h4>
      <p>Guidelines for protecting your trading capital and managing overall portfolio risk.</p>
      
      <h3>Step 1: Define Your Trading Style</h3>
      
      <h4>Time Frame Selection</h4>
      <ul>
        <li><strong>Scalping:</strong> Seconds to minutes</li>
        <li><strong>Day Trading:</strong> Minutes to hours</li>
        <li><strong>Swing Trading:</strong> Days to weeks</li>
        <li><strong>Position Trading:</strong> Weeks to months</li>
      </ul>
      
      <h4>Market Selection</h4>
      <p>Choose markets that align with your knowledge, capital, and time availability:</p>
      <ul>
        <li>Stock markets (domestic and international)</li>
        <li>Forex markets</li>
        <li>Commodity futures</li>
        <li>Cryptocurrency markets</li>
      </ul>
      
      <h3>Step 2: Develop Entry and Exit Rules</h3>
      
      <h4>Entry Signal Development</h4>
      <ol>
        <li>Identify your preferred technical indicators</li>
        <li>Backtest combinations of indicators</li>
        <li>Define specific entry conditions</li>
        <li>Add confirmation filters to reduce false signals</li>
        <li>Test on historical data</li>
      </ol>
      
      <h4>Exit Strategy Development</h4>
      <ul>
        <li><strong>Stop Losses:</strong> Fixed percentage, support/resistance, or ATR-based</li>
        <li><strong>Take Profits:</strong> Fixed targets, trailing stops, or partial exits</li>
        <li><strong>Time Stops:</strong> Maximum holding period regardless of performance</li>
      </ul>
      
      <h3>Step 3: Implement Risk Management</h3>
      
      <h4>Position Sizing Methods</h4>
      <ul>
        <li><strong>Fixed Dollar Amount:</strong> Risk the same dollar amount per trade</li>
        <li><strong>Fixed Percentage:</strong> Risk a fixed percentage of account value</li>
        <li><strong>Volatility-Based:</strong> Adjust position size based on market volatility</li>
        <li><strong>Kelly Criterion:</strong> Mathematical optimization based on win rate and payoff</li>
      </ul>
      
      <h4>Portfolio Risk Limits</h4>
      <ul>
        <li>Maximum percentage of capital at risk</li>
        <li>Maximum number of concurrent positions</li>
        <li>Correlation limits between positions</li>
        <li>Maximum daily and monthly loss limits</li>
      </ul>
      
      <h3>Step 4: Backtesting Your System</h3>
      
      <h4>Historical Testing</h4>
      <ul>
        <li>Test on at least 2-3 years of historical data</li>
        <li>Include different market conditions (bull, bear, sideways)</li>
        <li>Account for transaction costs and slippage</li>
        <li>Use out-of-sample testing for validation</li>
      </ul>
      
      <h4>Key Performance Metrics</h4>
      <ul>
        <li><strong>Win Rate:</strong> Percentage of profitable trades</li>
        <li><strong>Average Win/Loss:</strong> Ratio of average wins to average losses</li>
        <li><strong>Maximum Drawdown:</strong> Largest peak-to-trough decline</li>
        <li><strong>Sharpe Ratio:</strong> Risk-adjusted returns</li>
        <li><strong>Profit Factor:</strong> Total profits divided by total losses</li>
      </ul>
      
      <h3>Step 5: Paper Trading</h3>
      <p>Before using real money, test your system with paper trading:</p>
      <ul>
        <li>Follow your rules exactly as written</li>
        <li>Track all trades and performance metrics</li>
        <li>Keep detailed records of decisions and outcomes</li>
        <li>Identify any rule ambiguities or gaps</li>
        <li>Practice for at least 1-3 months</li>
      </ul>
      
      <h3>Step 6: Live Trading and Optimization</h3>
      
      <h4>Starting Small</h4>
      <ul>
        <li>Begin with small position sizes</li>
        <li>Gradually increase as you gain confidence</li>
        <li>Never risk more than you can afford to lose</li>
      </ul>
      
      <h4>Continuous Improvement</h4>
      <ul>
        <li>Regularly review and analyze your trades</li>
        <li>Identify patterns in both wins and losses</li>
        <li>Make incremental improvements to your system</li>
        <li>Keep detailed trading journals</li>
        <li>Stay disciplined with your rules</li>
      </ul>
      
      <h3>Common Mistakes to Avoid</h3>
      <ul>
        <li><strong>Over-optimization:</strong> Don't curve-fit your system to historical data</li>
        <li><strong>Changing Rules Mid-Trade:</strong> Stick to your predefined rules</li>
        <li><strong>Ignoring Risk Management:</strong> Always prioritize capital preservation</li>
        <li><strong>Emotional Trading:</strong> Let your system make decisions, not emotions</li>
        <li><strong>Lack of Patience:</strong> Wait for high-probability setups</li>
      </ul>
      
      <p>Remember, a good trading system is simple, robust, and well-tested. Focus on consistency over complexity, and always prioritize risk management over potential profits.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["trading-system", "systematic-trading", "backtesting", "risk-management", "strategy-development"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Building a Profitable Trading System - Complete Guide",
    seoDescription: "Learn to build a profitable trading system. Step-by-step guide covering entry/exit rules, risk management, backtesting, and optimization."
  },
  {
    title: "Psychology of Trading: Mastering Your Mind for Success",
    excerpt: "Understand the psychological aspects of trading and learn techniques to maintain emotional discipline and mental clarity.",
    content: `
      <h2>The Role of Psychology in Trading Success</h2>
      <p>Trading success is often more about psychology than strategy. Understanding and mastering your emotions can be the difference between consistent profits and costly mistakes.</p>
      
      <h3>Common Psychological Challenges in Trading</h3>
      
      <h4>1. Fear and Greed</h4>
      <p>These two emotions are the primary drivers of most trading mistakes:</p>
      
      <h5>Fear Manifestations:</h5>
      <ul>
        <li><strong>Fear of Missing Out (FOMO):</strong> Entering trades too late</li>
        <li><strong>Fear of Loss:</strong> Exiting profitable trades too early</li>
        <li><strong>Analysis Paralysis:</strong> Overthinking and missing opportunities</li>
      </ul>
      
      <h5>Greed Manifestations:</h5>
      <ul>
        <li><strong>Overtrading:</strong> Taking too many positions</li>
        <li><strong>Overleveraging:</strong> Using excessive margin</li>
        <li><strong>Holding Winners Too Long:</strong> Not taking profits at targets</li>
      </ul>
      
      <h4>2. Revenge Trading</h4>
      <p>After a loss, traders often try to "get even" quickly, leading to:</p>
      <ul>
        <li>Taking larger positions than normal</li>
        <li>Abandoning risk management rules</li>
        <li>Making emotional, unplanned trades</li>
        <li>Chasing losses with increasingly risky bets</li>
      </ul>
      
      <h4>3. Confirmation Bias</h4>
      <p>The tendency to seek information that confirms existing beliefs while ignoring contradictory evidence.</p>
      
      <h4>4. Overconfidence</h4>
      <p>After a series of wins, traders may become overconfident and:</p>
      <ul>
        <li>Increase position sizes without proper analysis</li>
        <li>Ignore risk management rules</li>
        <li>Take on excessive risk</li>
      </ul>
      
      <h3>Developing Emotional Discipline</h3>
      
      <h4>1. Pre-Trade Preparation</h4>
      <ul>
        <li><strong>Trading Plan:</strong> Define entry, exit, and risk parameters before trading</li>
        <li><strong>Daily Ritual:</strong> Establish a consistent pre-market routine</li>
        <li><strong>Mindset Check:</strong> Assess your emotional state before each session</li>
        <li><strong>Goals Setting:</strong> Set realistic daily and weekly targets</li>
      </ul>
      
      <h4>2. During-Trade Management</h4>
      <ul>
        <li><strong>Stick to Your Plan:</strong> Follow predefined rules religiously</li>
        <li><strong>Use Checklists:</strong> Create decision-making frameworks</li>
        <li><strong>Take Breaks:</strong> Step away from screens during high stress</li>
        <li><strong>Journal Entries:</strong> Record your thoughts and emotions</li>
      </ul>
      
      <h4>3. Post-Trade Analysis</h4>
      <ul>
        <li><strong>Review Decisions:</strong> Analyze both wins and losses objectively</li>
        <li><strong>Emotional Inventory:</strong> Note how you felt during trades</li>
        <li><strong>Identify Patterns:</strong> Look for recurring emotional triggers</li>
        <li><strong>Learn and Adapt:</strong> Adjust strategies based on insights</li>
      </ul>
      
      <h3>Mental Techniques for Traders</h3>
      
      <h4>1. Meditation and Mindfulness</h4>
      <p>Regular practice can help:</p>
      <ul>
        <li>Improve focus and concentration</li>
        <li>Reduce emotional reactivity</li>
        <li>Increase self-awareness</li>
        <li>Enhance decision-making clarity</li>
      </ul>
      
      <h4>2. Visualization</h4>
      <p>Practice visualizing successful trades and proper risk management to reinforce positive behavior patterns.</p>
      
      <h4>3. Breathing Exercises</h4>
      <p>Use controlled breathing to manage stress and maintain calm during volatile market conditions.</p>
      
      <h4>4. Cognitive Reframing</h4>
      <p>Challenge negative thoughts and reframe losses as learning opportunities rather than failures.</p>
      
      <h3>Building Mental Resilience</h3>
      
      <h4>1. Accept Losses as Part of Trading</h4>
      <ul>
        <li>No trading system has a 100% win rate</li>
        <li>Focus on risk management over perfection</li>
        <li>View losses as the cost of doing business</li>
      </ul>
      
      <h4>2. Develop Patience</h4>
      <ul>
        <li>Wait for high-probability setups</li>
        <li>Don't force trades in poor conditions</li>
        <li>Understand that inactivity can be profitable</li>
      </ul>
      
      <h4>3. Maintain Perspective</h4>
      <ul>
        <li>Keep long-term goals in mind</li>
        <li>Don't let individual trades define your self-worth</li>
        <li>Remember that markets will always present opportunities</li>
      </ul>
      
      <h3>Creating Support Systems</h3>
      
      <h4>1. Trading Community</h4>
      <ul>
        <li>Connect with other traders for support</li>
        <li>Share experiences and strategies</li>
        <li>Learn from others' mistakes and successes</li>
      </ul>
      
      <h4>2. Professional Help</h4>
      <ul>
        <li>Consider working with a trading coach</li>
        <li>Seek therapy if emotional issues are affecting trading</li>
        <li>Join support groups for traders</li>
      </ul>
      
      <h4>3. Work-Life Balance</h4>
      <ul>
        <li>Maintain hobbies and interests outside trading</li>
        <li>Exercise regularly to manage stress</li>
        <li>Get adequate sleep and nutrition</li>
        <li>Spend time with family and friends</li>
      </ul>
      
      <h3>Practical Tips for Mental Management</h3>
      <ul>
        <li><strong>Start Small:</strong> Begin with minimal risk until you build confidence</li>
        <li><strong>Use Stop Losses:</strong> Let the system protect you from emotional decisions</li>
        <li><strong>Take Regular Breaks:</strong> Avoid overstimulation and decision fatigue</li>
        <li><strong>Maintain Records:</strong> Keep detailed journals of your emotional state</li>
        <li><strong>Celebrate Small Wins:</strong> Acknowledge progress and positive behavior</li>
        <li><strong>Learn Continuously:</strong> Focus on improvement rather than perfection</li>
      </ul>
      
      <p>Remember, mastering trading psychology is a journey, not a destination. Be patient with yourself and focus on gradual improvement in your emotional discipline and mental clarity.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    category: "business",
    tags: ["trading-psychology", "emotions", "discipline", "mindset", "mental-management"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Trading Psychology - Master Your Mind for Trading Success",
    seoDescription: "Master trading psychology and emotional discipline. Learn to overcome fear, greed, and develop mental resilience for consistent trading success."
  }
];

async function addMoreDummyBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to be the author
    const adminUser = await User.findOne({ roles: { $in: ['admin'] } });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.name} (${adminUser.email})`);

    // Check if blogs already exist to avoid duplicates
    const existingTitles = await Blog.find({}, 'title');
    const existingTitleSet = new Set(existingTitles.map(b => b.title));

    let createdCount = 0;
    for (const blogData of additionalDummyBlogs) {
      // Skip if blog with same title already exists
      if (existingTitleSet.has(blogData.title)) {
        console.log(`Skipping existing blog: ${blogData.title}`);
        continue;
      }

      // Generate slug from title
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

    console.log('✅ Additional dummy blogs created successfully!');
    console.log(`📊 Created ${createdCount} new trading-related blogs`);
    
    // Show updated summary
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ publishStatus: 'published' });
    const featuredBlogs = await Blog.countDocuments({ featured: true });
    
    console.log('\n📈 Updated Blog Statistics:');
    console.log(`Total blogs: ${totalBlogs}`);
    console.log(`Published blogs: ${publishedBlogs}`);
    console.log(`Featured blogs: ${featuredBlogs}`);

  } catch (error) {
    console.error('Error creating additional dummy blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addMoreDummyBlogs();
