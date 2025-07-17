# Personality Spark 🎯

An AI-powered personality exploration platform that creates unique, engaging quizzes without mandatory registration. Built with React Native Web and FastAPI.

## 🚀 Features

- **AI-Generated Quizzes**: Every quiz is unique, powered by AI
- **No Registration Required**: Jump right in without barriers
- **Multiple Quiz Types**: Big 5, Daily Challenge, Quick Assessment, and more
- **Beautiful Visualizations**: Interactive personality trait charts
- **Social Sharing**: Share your results with friends
- **Mobile-First Design**: Works perfectly on all devices
- **Real-time Results**: Instant personality insights

## 🛠️ Tech Stack

### Frontend
- **React Native Web** with TypeScript
- **Custom Navigation** for web compatibility
- **Responsive Design** for all screen sizes

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** ORM with PostgreSQL
- **Redis** for caching
- **Mock AI Integration** (Ready for DeepSeek/OpenRouter)

### Infrastructure
- **Docker** & **Docker Compose**
- **Nginx** reverse proxy
- **Production-ready** multi-stage builds

## 📦 Project Structure

```
personality-spark/
├── apps/
│   └── web/              # React Native Web frontend
├── backend/              # FastAPI backend
│   ├── api/             # API endpoints
│   ├── models/          # Database models
│   └── services/        # Business logic
├── docker-compose.yml   # Local development setup
└── Dockerfile.production # Production deployment
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/abdul712/personality-spark.git
cd personality-spark
```

2. **Set up environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup (without Docker)

**Frontend:**
```bash
cd apps/web
npm install
npm start
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --reload
```

## 🌐 API Endpoints

### Quiz Management
- `GET /api/v1/quizzes/categories` - List quiz categories
- `GET /api/v1/quizzes/generate/{quiz_type}` - Generate AI quiz
- `POST /api/v1/quizzes/submit` - Submit quiz answers
- `GET /api/v1/quizzes/result/{result_id}` - Get results

### AI Integration
- `POST /api/v1/ai/generate-quiz` - Custom AI quiz
- `POST /api/v1/ai/analyze-personality` - Analyze responses

### Social Features
- `POST /api/v1/share/create-card` - Create share card
- `POST /api/v1/share/challenge` - Create challenge

## 🚢 Deployment

### Using Docker (Production)
```bash
docker build -f Dockerfile.production -t personality-spark .
docker run -p 80:80 personality-spark
```

### Coolify Deployment
1. Connect your GitHub repository
2. Select `Dockerfile.production` as build file
3. Set environment variables
4. Deploy!

### Environment Variables
```env
# AI Services
DEEPSEEK_API_KEY=your_key
OPENROUTER_API_KEY=your_key

# Database
DATABASE_URL=postgresql://user:pass@host/db
REDIS_URL=redis://host:6379

# Security
SECRET_KEY=your_secret_key
```

## 🧪 Testing

**Frontend:**
```bash
cd apps/web
npm test
```

**Backend:**
```bash
cd backend
pytest
```

## 📊 Current Status

- ✅ Frontend: All main screens implemented
- ✅ Backend: All API endpoints with mock data
- ✅ Infrastructure: Docker setup complete
- 🚧 AI Integration: Mock implementation (ready for real APIs)
- 🚧 Authentication: Basic structure (needs JWT implementation)
- 🚧 Mobile Apps: React Native ready (needs Expo setup)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with React Native Web for cross-platform compatibility
- FastAPI for high-performance backend
- Designed for Coolify deployment

---

**Repository**: https://github.com/abdul712/personality-spark  
**Documentation**: See [CLAUDE.md](CLAUDE.md) for detailed project documentation