from sqlalchemy import Column, String, DateTime, Boolean, Float, Integer, ForeignKey, JSON, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)
    username = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    quiz_results = relationship("QuizResult", back_populates="user")
    saved_quizzes = relationship("SavedQuiz", back_populates="user")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    quiz_type = Column(String(100), nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    shared = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="quiz_results")

class SavedQuiz(Base):
    __tablename__ = "saved_quizzes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="saved_quizzes")

class QuizAnalytics(Base):
    __tablename__ = "quiz_analytics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_type = Column(String(100), nullable=True)
    completion_rate = Column(Float, nullable=True)
    avg_time_seconds = Column(Integer, nullable=True)
    share_rate = Column(Float, nullable=True)
    created_at = Column(Date, default=datetime.utcnow)