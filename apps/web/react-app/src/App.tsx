import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz-list" element={<QuizList />} />
        <Route path="/quiz/:quizType" element={<Quiz />} />
        <Route path="/result/:resultId" element={<Result />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/:slug" element={<BlogPost />} />
      </Routes>
    </Router>
  );
}

export default App;