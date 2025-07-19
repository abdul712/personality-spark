import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import Quiz from './pages/Quiz';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz-list" element={<QuizList />} />
        <Route path="/quiz/:quizType" element={<Quiz />} />
        <Route path="/result/:resultId" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;