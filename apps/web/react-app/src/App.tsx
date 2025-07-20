import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { TrackingScripts } from './components/TrackingScripts';

function App() {
  return (
    <Router>
      <TrackingScripts />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz-list" element={<QuizList />} />
        <Route path="/quiz/:quizType" element={<Quiz />} />
        <Route path="/result/:resultId" element={<Result />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/:slug" element={<BlogPost />} />
      </Routes>
    </Router>
  );
}

export default App;