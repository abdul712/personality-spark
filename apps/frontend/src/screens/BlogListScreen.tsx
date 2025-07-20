import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from '../styles';
import { api } from '../services/api';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
}

export const BlogListScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await api.getBlogPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (slug: string) => {
    navigation.navigate('BlogPost', { slug });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Blog</Text>
        <Text style={styles.subtitle}>Discover insights about personality and self-discovery</Text>
        
        <View style={styles.section}>
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.card, { marginBottom: 16 }]}
              onPress={() => handlePostPress(post.slug)}
            >
              <Text style={styles.cardTitle}>{post.title}</Text>
              <Text style={styles.bodyText}>{post.excerpt}</Text>
              <Text style={[styles.caption, { marginTop: 8 }]}>{post.date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};