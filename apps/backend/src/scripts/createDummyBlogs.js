const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { createSlug } = require('../utils/slugHelper');
require('dotenv').config();

const dummyBlogs = [
  {
    title: "10 Essential Trading Strategies for Beginners in 2024",
    excerpt: "Learn the fundamental trading strategies that every beginner should know to start their trading journey successfully.",
    content: `
      <h2>Introduction to Trading Strategies</h2>
      <p>Trading in the financial markets can be both exciting and challenging, especially for beginners. With the right strategies and knowledge, you can navigate the markets more effectively and increase your chances of success.</p>
      
      <h3>1. Buy and Hold Strategy</h3>
      <p>The buy and hold strategy is one of the simplest and most effective approaches for long-term investors. This strategy involves purchasing stocks or other assets and holding them for an extended period, regardless of short-term market fluctuations.</p>
      
      <h3>2. Dollar-Cost Averaging</h3>
      <p>This strategy involves investing a fixed amount of money at regular intervals, regardless of the asset's price. This approach helps reduce the impact of volatility and can lead to better average purchase prices over time.</p>
      
      <h3>3. Momentum Trading</h3>
      <p>Momentum trading involves buying assets that are showing strong upward price trends and selling them when the momentum starts to fade. This strategy works well in trending markets.</p>
      
      <h3>4. Mean Reversion Strategy</h3>
      <p>This strategy is based on the assumption that asset prices will eventually return to their average or mean value. Traders using this approach buy when prices are below the mean and sell when they're above it.</p>
      
      <h3>5. Breakout Trading</h3>
      <p>Breakout trading involves identifying key support and resistance levels and entering positions when the price breaks through these levels with significant volume.</p>
      
      <h2>Risk Management Tips</h2>
      <ul>
        <li>Never risk more than 2% of your trading capital on a single trade</li>
        <li>Always set stop-loss orders to limit potential losses</li>
        <li>Diversify your portfolio across different asset classes</li>
        <li>Keep detailed records of all your trades</li>
        <li>Continuously educate yourself about market dynamics</li>
      </ul>
      
      <p>Remember, successful trading requires patience, discipline, and continuous learning. Start with paper trading to practice these strategies before risking real money.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "technology",
    tags: ["trading", "beginner", "strategies", "investment", "finance"],
    publishStatus: "published",
    featured: true,
    seoTitle: "10 Essential Trading Strategies for Beginners 2024",
    seoDescription: "Learn the top 10 trading strategies every beginner should know. From buy-and-hold to momentum trading, master these essential techniques for successful trading."
  },
  {
    title: "Cryptocurrency Trading: Complete Guide for 2024",
    excerpt: "Everything you need to know about cryptocurrency trading, from basic concepts to advanced strategies and risk management.",
    content: `
      <h2>Understanding Cryptocurrency Trading</h2>
      <p>Cryptocurrency trading has become one of the most popular forms of investment in recent years. With the rise of digital currencies like Bitcoin, Ethereum, and thousands of altcoins, traders have numerous opportunities to profit from price movements.</p>
      
      <h3>Types of Cryptocurrency Trading</h3>
      
      <h4>1. Spot Trading</h4>
      <p>Spot trading involves buying and selling cryptocurrencies at their current market price. This is the most straightforward form of crypto trading where you own the actual digital assets.</p>
      
      <h4>2. Futures Trading</h4>
      <p>Futures trading allows you to speculate on the future price of cryptocurrencies without owning the underlying asset. This type of trading offers leverage but comes with higher risks.</p>
      
      <h4>3. Margin Trading</h4>
      <p>Margin trading involves borrowing funds to increase your trading position. While this can amplify profits, it also significantly increases the risk of losses.</p>
      
      <h3>Popular Cryptocurrency Exchanges</h3>
      <ul>
        <li><strong>Binance:</strong> World's largest crypto exchange by trading volume</li>
        <li><strong>Coinbase:</strong> User-friendly platform for beginners</li>
        <li><strong>Kraken:</strong> Known for security and regulatory compliance</li>
        <li><strong>KuCoin:</strong> Wide selection of altcoins</li>
      </ul>
      
      <h3>Technical Analysis for Crypto Trading</h3>
      <p>Technical analysis is crucial for crypto trading success. Key indicators to watch include:</p>
      <ul>
        <li>Moving averages (SMA, EMA)</li>
        <li>Relative Strength Index (RSI)</li>
        <li>MACD (Moving Average Convergence Divergence)</li>
        <li>Support and resistance levels</li>
        <li>Volume analysis</li>
      </ul>
      
      <h3>Risk Management in Crypto Trading</h3>
      <p>Cryptocurrency markets are highly volatile, making risk management essential:</p>
      <ul>
        <li>Never invest more than you can afford to lose</li>
        <li>Use stop-loss orders to limit losses</li>
        <li>Diversify your crypto portfolio</li>
        <li>Keep your cryptocurrencies in secure wallets</li>
        <li>Stay updated with market news and regulations</li>
      </ul>
      
      <p>Remember, cryptocurrency trading carries significant risks due to market volatility. Always do your research and consider consulting with financial advisors before making investment decisions.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2036&q=80",
    category: "technology",
    tags: ["cryptocurrency", "bitcoin", "trading", "blockchain", "digital-assets"],
    publishStatus: "published",
    featured: true,
    seoTitle: "Cryptocurrency Trading Guide 2024 - Complete Tutorial",
    seoDescription: "Master cryptocurrency trading with our complete guide. Learn spot trading, futures, margin trading, technical analysis, and risk management strategies."
  },
  {
    title: "Stock Market Analysis: Reading Charts Like a Pro",
    excerpt: "Learn how to analyze stock charts and identify profitable trading opportunities using technical analysis techniques.",
    content: `
      <h2>Mastering Stock Chart Analysis</h2>
      <p>Chart analysis is the foundation of successful stock trading. By learning to read price patterns, volume indicators, and technical signals, you can make more informed trading decisions.</p>
      
      <h3>Types of Charts</h3>
      
      <h4>1. Candlestick Charts</h4>
      <p>Candlestick charts provide detailed information about price movements within a specific time period. Each candle shows the open, high, low, and close prices.</p>
      
      <h4>2. Line Charts</h4>
      <p>Line charts connect closing prices over time, providing a simple view of price trends. These are useful for identifying overall market direction.</p>
      
      <h4>3. Bar Charts</h4>
      <p>Bar charts display the same information as candlestick charts but in a different format, showing open, high, low, and close prices as vertical bars.</p>
      
      <h3>Key Chart Patterns</h3>
      
      <h4>Reversal Patterns</h4>
      <ul>
        <li><strong>Head and Shoulders:</strong> Indicates potential trend reversal</li>
        <li><strong>Double Top/Bottom:</strong> Shows resistance/support levels</li>
        <li><strong>Triple Top/Bottom:</strong> Stronger version of double patterns</li>
      </ul>
      
      <h4>Continuation Patterns</h4>
      <ul>
        <li><strong>Flags and Pennants:</strong> Short-term consolidation before trend continuation</li>
        <li><strong>Triangles:</strong> Ascending, descending, or symmetrical patterns</li>
        <li><strong>Wedges:</strong> Converging trend lines indicating potential breakout</li>
      </ul>
      
      <h3>Essential Technical Indicators</h3>
      
      <h4>Trend Indicators</h4>
      <ul>
        <li><strong>Moving Averages:</strong> SMA, EMA for trend identification</li>
        <li><strong>MACD:</strong> Moving Average Convergence Divergence</li>
        <li><strong>ADX:</strong> Average Directional Index for trend strength</li>
      </ul>
      
      <h4>Momentum Indicators</h4>
      <ul>
        <li><strong>RSI:</strong> Relative Strength Index for overbought/oversold conditions</li>
        <li><strong>Stochastic:</strong> Momentum oscillator</li>
        <li><strong>Williams %R:</strong> Momentum indicator</li>
      </ul>
      
      <h4>Volume Indicators</h4>
      <ul>
        <li><strong>OBV:</strong> On-Balance Volume</li>
        <li><strong>Volume Rate of Change:</strong> Measures volume momentum</li>
        <li><strong>Accumulation/Distribution Line:</strong> Volume-price relationship</li>
      </ul>
      
      <h3>Support and Resistance Levels</h3>
      <p>Support and resistance levels are crucial for determining entry and exit points:</p>
      <ul>
        <li><strong>Support:</strong> Price level where buying interest is strong enough to prevent further decline</li>
        <li><strong>Resistance:</strong> Price level where selling pressure is strong enough to prevent further advance</li>
        <li><strong>Breakouts:</strong> When price moves beyond these levels with significant volume</li>
      </ul>
      
      <h3>Practical Trading Tips</h3>
      <ul>
        <li>Always confirm chart patterns with volume analysis</li>
        <li>Use multiple timeframes for better accuracy</li>
        <li>Combine technical analysis with fundamental analysis</li>
        <li>Practice with paper trading before using real money</li>
        <li>Keep detailed trading journals to improve your skills</li>
      </ul>
      
      <p>Remember, chart analysis is not foolproof, but it provides valuable insights into market behavior and potential trading opportunities.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["stock-market", "technical-analysis", "chart-patterns", "trading", "investing"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Stock Market Chart Analysis - Technical Analysis Guide",
    seoDescription: "Learn professional stock chart analysis techniques. Master candlestick patterns, technical indicators, support/resistance, and trading strategies."
  },
  {
    title: "Forex Trading Fundamentals: Currency Pairs Explained",
    excerpt: "Understanding currency pairs is essential for successful forex trading. Learn about major, minor, and exotic pairs.",
    content: `
      <h2>Introduction to Forex Currency Pairs</h2>
      <p>Forex trading involves buying and selling currency pairs. Understanding how currency pairs work is fundamental to successful forex trading. In forex, currencies are always traded in pairs because you're buying one currency while simultaneously selling another.</p>
      
      <h3>How Currency Pairs Work</h3>
      <p>Every currency pair consists of two currencies: the base currency (first) and the quote currency (second). The exchange rate tells you how much of the quote currency you need to buy one unit of the base currency.</p>
      
      <p><strong>Example:</strong> In EUR/USD = 1.2000, you need 1.20 US dollars to buy 1 Euro.</p>
      
      <h3>Types of Currency Pairs</h3>
      
      <h4>1. Major Currency Pairs</h4>
      <p>Major pairs include the US dollar and are the most traded currency pairs in the forex market:</p>
      <ul>
        <li><strong>EUR/USD:</strong> Euro vs US Dollar</li>
        <li><strong>GBP/USD:</strong> British Pound vs US Dollar</li>
        <li><strong>USD/JPY:</strong> US Dollar vs Japanese Yen</li>
        <li><strong>USD/CHF:</strong> US Dollar vs Swiss Franc</li>
        <li><strong>AUD/USD:</strong> Australian Dollar vs US Dollar</li>
        <li><strong>USD/CAD:</strong> US Dollar vs Canadian Dollar</li>
        <li><strong>NZD/USD:</strong> New Zealand Dollar vs US Dollar</li>
      </ul>
      
      <h4>2. Minor Currency Pairs (Cross Pairs)</h4>
      <p>Minor pairs don't include the US dollar but involve other major currencies:</p>
      <ul>
        <li><strong>EUR/GBP:</strong> Euro vs British Pound</li>
        <li><strong>EUR/JPY:</strong> Euro vs Japanese Yen</li>
        <li><strong>GBP/JPY:</strong> British Pound vs Japanese Yen</li>
        <li><strong>AUD/JPY:</strong> Australian Dollar vs Japanese Yen</li>
      </ul>
      
      <h4>3. Exotic Currency Pairs</h4>
      <p>Exotic pairs involve one major currency and one currency from an emerging market:</p>
      <ul>
        <li><strong>USD/ZAR:</strong> US Dollar vs South African Rand</li>
        <li><strong>EUR/TRY:</strong> Euro vs Turkish Lira</li>
        <li><strong>USD/MXN:</strong> US Dollar vs Mexican Peso</li>
        <li><strong>GBP/SEK:</strong> British Pound vs Swedish Krona</li>
      </ul>
      
      <h3>Factors Affecting Currency Pairs</h3>
      
      <h4>Economic Indicators</h4>
      <ul>
        <li><strong>GDP Growth:</strong> Economic performance affects currency strength</li>
        <li><strong>Inflation Rates:</strong> Central bank policies and interest rates</li>
        <li><strong>Employment Data:</strong> Unemployment rates and job creation</li>
        <li><strong>Trade Balance:</strong> Import/export relationships between countries</li>
      </ul>
      
      <h4>Political and Geopolitical Factors</h4>
      <ul>
        <li>Government stability and policies</li>
        <li>International trade agreements</li>
        <li>Geopolitical tensions and conflicts</li>
        <li>Elections and political uncertainty</li>
      </ul>
      
      <h4>Central Bank Policies</h4>
      <ul>
        <li>Interest rate decisions</li>
        <li>Quantitative easing programs</li>
        <li>Currency intervention policies</li>
        <li>Monetary policy statements</li>
      </ul>
      
      <h3>Trading Strategies for Currency Pairs</h3>
      
      <h4>1. Trend Following</h4>
      <p>Identify and follow established trends in currency pair movements using technical analysis tools.</p>
      
      <h4>2. Range Trading</h4>
      <p>Trade within established support and resistance levels when currencies are consolidating.</p>
      
      <h4>3. Carry Trading</h4>
      <p>Buy currencies with high interest rates and sell currencies with low interest rates to profit from interest rate differentials.</p>
      
      <h4>4. News Trading</h4>
      <p>Trade based on economic news releases and their impact on currency values.</p>
      
      <h3>Risk Management in Forex Trading</h3>
      <ul>
        <li>Use appropriate position sizing</li>
        <li>Set stop-loss orders to limit losses</li>
        <li>Diversify across different currency pairs</li>
        <li>Monitor economic calendars for important events</li>
        <li>Keep emotions in check and stick to your trading plan</li>
      </ul>
      
      <p>Forex trading offers significant opportunities but also carries substantial risks. Always educate yourself thoroughly and practice with demo accounts before trading with real money.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["forex", "currency-pairs", "trading", "foreign-exchange", "major-pairs"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Forex Trading Currency Pairs - Complete Guide 2024",
    seoDescription: "Master forex currency pairs trading. Learn about major, minor, and exotic pairs, trading strategies, and risk management techniques."
  },
  {
    title: "Options Trading Strategies for Beginners",
    excerpt: "Learn the basics of options trading, including calls, puts, and essential strategies to get started in options markets.",
    content: `
      <h2>Understanding Options Trading</h2>
      <p>Options trading provides traders with the opportunity to profit from price movements in underlying assets without actually owning them. Options give you the right, but not the obligation, to buy or sell an asset at a predetermined price within a specific time frame.</p>
      
      <h3>Basic Options Concepts</h3>
      
      <h4>Call Options</h4>
      <p>A call option gives you the right to buy an underlying asset at a specific price (strike price) before the expiration date. You buy calls when you expect the price to rise.</p>
      
      <h4>Put Options</h4>
      <p>A put option gives you the right to sell an underlying asset at a specific price before the expiration date. You buy puts when you expect the price to fall.</p>
      
      <h4>Key Terms</h4>
      <ul>
        <li><strong>Strike Price:</strong> The price at which you can buy (call) or sell (put) the underlying asset</li>
        <li><strong>Expiration Date:</strong> The last day you can exercise your option</li>
        <li><strong>Premium:</strong> The cost of buying an option</li>
        <li><strong>Intrinsic Value:</strong> The difference between the strike price and current market price</li>
        <li><strong>Time Value:</strong> The portion of the premium that reflects time until expiration</li>
      </ul>
      
      <h3>Popular Options Trading Strategies</h3>
      
      <h4>1. Long Call Strategy</h4>
      <p>Buy call options when you expect the underlying asset's price to rise significantly. This strategy has limited risk (the premium paid) and unlimited profit potential.</p>
      
      <h4>2. Long Put Strategy</h4>
      <p>Buy put options when you expect the underlying asset's price to fall. Like long calls, this strategy has limited risk and high profit potential if the price moves in your favor.</p>
      
      <h4>3. Covered Call Strategy</h4>
      <p>Own the underlying stock and sell call options against it. This strategy generates income from the premium while potentially limiting upside gains.</p>
      
      <h4>4. Protective Put Strategy</h4>
      <p>Own the underlying stock and buy put options to protect against downside risk. This acts like insurance for your stock position.</p>
      
      <h4>5. Straddle Strategy</h4>
      <p>Buy both a call and a put option with the same strike price and expiration date. This strategy profits from significant price movements in either direction.</p>
      
      <h4>6. Iron Condor Strategy</h4>
      <p>A complex strategy involving four options with different strike prices. It profits when the underlying asset stays within a specific price range.</p>
      
      <h3>Risk Management in Options Trading</h3>
      
      <h4>Position Sizing</h4>
      <ul>
        <li>Never risk more than 2-5% of your trading capital on a single options trade</li>
        <li>Consider the maximum loss potential before entering a position</li>
        <li>Use proper position sizing based on your risk tolerance</li>
      </ul>
      
      <h4>Time Decay Management</h4>
      <ul>
        <li>Be aware of theta (time decay) and its impact on option prices</li>
        <li>Options lose value as expiration approaches</li>
        <li>Consider shorter-term options for quick trades and longer-term options for positions you want to hold</li>
      </ul>
      
      <h4>Volatility Considerations</h4>
      <ul>
        <li>Understand implied volatility and its effect on option premiums</li>
        <li>High volatility increases option prices</li>
        <li>Low volatility decreases option prices</li>
      </ul>
      
      <h3>Common Mistakes to Avoid</h3>
      <ul>
        <li><strong>Ignoring Time Decay:</strong> Options lose value over time, even if the underlying asset doesn't move</li>
        <li><strong>Overleveraging:</strong> Using too much leverage can lead to significant losses</li>
        <li><strong>Not Understanding Greeks:</strong> Delta, gamma, theta, and vega affect option pricing</li>
        <li><strong>Holding Until Expiration:</strong> Most options should be closed before expiration</li>
        <li><strong>Lack of Plan:</strong> Always have entry and exit strategies defined</li>
      </ul>
      
      <h3>Getting Started with Options Trading</h3>
      <ol>
        <li><strong>Educate Yourself:</strong> Learn the basics thoroughly before trading</li>
        <li><strong>Paper Trade:</strong> Practice with virtual money first</li>
        <li><strong>Start Small:</strong> Begin with simple strategies and small positions</li>
        <li><strong>Choose the Right Broker:</strong> Find a broker with good options trading tools</li>
        <li><strong>Develop a Plan:</strong> Create a trading plan and stick to it</li>
      </ol>
      
      <p>Options trading can be highly profitable but also complex and risky. Take time to understand all aspects before committing real money, and always prioritize risk management over potential profits.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["options-trading", "calls", "puts", "strategies", "derivatives"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Options Trading Strategies for Beginners - Complete Guide",
    seoDescription: "Learn options trading from scratch. Master calls, puts, popular strategies, risk management, and common mistakes to avoid in options trading."
  },
  {
    title: "Risk Management in Trading: Protecting Your Capital",
    excerpt: "Learn essential risk management techniques to protect your trading capital and improve your long-term success rate.",
    content: `
      <h2>The Importance of Risk Management in Trading</h2>
      <p>Risk management is the most critical aspect of successful trading. No matter how good your trading strategy is, without proper risk management, you're likely to lose money over time. This guide covers essential risk management techniques that every trader should implement.</p>
      
      <h3>Core Risk Management Principles</h3>
      
      <h4>1. Never Risk More Than You Can Afford to Lose</h4>
      <p>This is the golden rule of trading. Only trade with money that you can afford to lose completely. Never use money needed for essential expenses like rent, food, or medical bills.</p>
      
      <h4>2. Use Proper Position Sizing</h4>
      <p>Position sizing determines how much of your capital you risk on each trade. A common rule is to risk no more than 1-2% of your trading capital on any single trade.</p>
      
      <h4>3. Set Stop-Loss Orders</h4>
      <p>Stop-loss orders automatically close your position when the price moves against you by a predetermined amount. This limits your potential losses on each trade.</p>
      
      <h3>Position Sizing Strategies</h3>
      
      <h4>Fixed Percentage Method</h4>
      <p>Risk a fixed percentage of your account balance on each trade. For example, if you have a $10,000 account and risk 2%, you would risk $200 per trade.</p>
      
      <h4>Fixed Dollar Amount Method</h4>
      <p>Risk a fixed dollar amount on each trade, regardless of account size. This method is simpler but doesn't adjust for account growth or decline.</p>
      
      <h4>Kelly Criterion</h4>
      <p>A mathematical formula that calculates the optimal position size based on your win rate and average win/loss ratio. This method can maximize long-term growth but requires accurate statistics.</p>
      
      <h3>Stop-Loss Strategies</h3>
      
      <h4>Percentage-Based Stop Loss</h4>
      <p>Set your stop loss at a fixed percentage below your entry price. For example, if you buy a stock at $100, you might set a stop loss at $95 (5% loss).</p>
      
      <h4>Support/Resistance Stop Loss</h4>
      <p>Place your stop loss just below key support levels (for long positions) or above resistance levels (for short positions).</p>
      
      <h4>Volatility-Based Stop Loss</h4>
      <p>Use the Average True Range (ATR) indicator to set stop losses based on market volatility. More volatile markets require wider stops.</p>
      
      <h4>Trailing Stop Loss</h4>
      <p>Move your stop loss in favor of your trade as the price moves in your direction. This locks in profits while allowing for continued gains.</p>
      
      <h3>Portfolio Risk Management</h3>
      
      <h4>Diversification</h4>
      <p>Don't put all your money into a single trade or asset class. Spread your risk across different markets, sectors, and timeframes.</p>
      
      <h4>Correlation Analysis</h4>
      <p>Understand how different assets move relative to each other. Avoid having too many highly correlated positions that could all move against you simultaneously.</p>
      
      <h4>Maximum Drawdown Limits</h4>
      <p>Set a maximum acceptable drawdown for your account. If you reach this limit, stop trading and reassess your strategy.</p>
      
      <h3>Psychological Risk Management</h3>
      
      <h4>Emotional Control</h4>
      <p>Keep emotions out of your trading decisions. Fear and greed are the biggest enemies of successful trading.</p>
      
      <h4>Trading Rules and Discipline</h4>
      <p>Create a set of trading rules and stick to them religiously. This helps remove emotion from your trading decisions.</p>
      
      <h4>Regular Review and Adjustment</h4>
      <p>Regularly review your trades and risk management performance. Adjust your strategies based on what you learn.</p>
      
      <h3>Risk Management Tools and Techniques</h3>
      
      <h4>Risk-Reward Ratio</h4>
      <p>Always aim for trades with a favorable risk-reward ratio. A common minimum is 1:2, meaning you risk $1 to potentially make $2.</p>
      
      <h4>Maximum Daily Loss Limit</h4>
      <p>Set a maximum amount you're willing to lose in a single day. Once reached, stop trading for the day.</p>
      
      <h4>Position Limits</h4>
      <p>Limit the number of open positions at any time to avoid overexposure and maintain proper oversight.</p>
      
      <h4>Regular Account Monitoring</h4>
      <p>Monitor your account regularly to track performance and identify any risk management issues early.</p>
      
      <h3>Common Risk Management Mistakes</h3>
      <ul>
        <li><strong>Not Using Stop Losses:</strong> This is the most common and costly mistake</li>
        <li><strong>Overleveraging:</strong> Using too much leverage amplifies both gains and losses</li>
        <li><strong>Revenge Trading:</strong> Trying to recover losses with larger, riskier trades</li>
        <li><strong>Ignoring Market Conditions:</strong> Not adjusting risk management for different market environments</li>
        <li><strong>Lack of Planning:</strong> Not having a clear risk management plan before entering trades</li>
      </ul>
      
      <h3>Creating Your Risk Management Plan</h3>
      <ol>
        <li><strong>Define Your Risk Tolerance:</strong> How much can you afford to lose?</li>
        <li><strong>Set Position Sizing Rules:</strong> How much will you risk per trade?</li>
        <li><strong>Establish Stop-Loss Rules:</strong> Where will you cut losses?</li>
        <li><strong>Create Diversification Guidelines:</strong> How will you spread risk?</li>
        <li><strong>Set Performance Limits:</strong> What are your maximum drawdown limits?</li>
        <li><strong>Plan Regular Reviews:</strong> How often will you assess your risk management?</li>
      </ol>
      
      <p>Remember, the goal of risk management is not to eliminate all risk but to manage it effectively. Proper risk management allows you to stay in the game long enough to benefit from your trading edge and compound your returns over time.</p>
    `,
    featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "business",
    tags: ["risk-management", "trading", "stop-loss", "position-sizing", "portfolio-management"],
    publishStatus: "published",
    featured: false,
    seoTitle: "Trading Risk Management - Protect Your Capital Guide",
    seoDescription: "Master risk management in trading. Learn position sizing, stop losses, portfolio diversification, and psychological risk control techniques."
  }
];

async function createDummyBlogs() {
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

    // Create dummy blogs
    for (const blogData of dummyBlogs) {
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
    }

    console.log('✅ All dummy blogs created successfully!');
    console.log(`📊 Created ${dummyBlogs.length} trading-related blogs`);
    
    // Show summary
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ publishStatus: 'published' });
    const featuredBlogs = await Blog.countDocuments({ featured: true });
    
    console.log('\n📈 Blog Statistics:');
    console.log(`Total blogs: ${totalBlogs}`);
    console.log(`Published blogs: ${publishedBlogs}`);
    console.log(`Featured blogs: ${featuredBlogs}`);

  } catch (error) {
    console.error('Error creating dummy blogs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createDummyBlogs();