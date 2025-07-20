import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import styles from '../styles';
import { api } from '../services/api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  readTime: string;
}

export const BlogPostScreen = ({ route }: any) => {
  const { slug } = route.params;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const response = await api.getBlogPost(slug);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.bodyText}>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <Text style={styles.caption}>{post.date}</Text>
          <Text style={[styles.caption, { marginLeft: 16 }]}>{post.readTime}</Text>
        </View>
        
        <View 
          style={styles.section}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </View>
    </ScrollView>
  );
};