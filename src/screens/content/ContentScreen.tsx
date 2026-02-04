import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenWrapper } from '@/components/layout';
import { Text, ImageCard } from '@/components/ui';

type Category = 'resurser' | 'kurser' | 'plattformar' | 'event';

export const ContentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialCategory = route.params?.category || 'resurser';
  
  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'resurser', name: 'Resurser', emoji: '📝', color: '#8a4fff' },
    { id: 'kurser', name: 'Kurser', emoji: '📚', color: '#6366f1' },
    { id: 'plattformar', name: 'Plattformar', emoji: '🧠', color: '#00d8a2' },
    { id: 'event', name: 'Event', emoji: '🎯', color: '#ff3366' },
  ];

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('category', activeCategory)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setContent(data || []);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [activeCategory]);

  return (
    <ScreenWrapper title="Innehåll">
      {/* Category Tabs */}
      <View className="mb-8">
        <View className="flex-row flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id as Category)}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  isActive 
                    ? 'bg-primary border-primary' 
                    : 'bg-background-50 border-primary/10'
                }`}
                activeOpacity={0.8}
              >
                <Text className="mr-2 text-lg">{cat.emoji}</Text>
                <Text 
                  weight={isActive ? "bold" : "medium"}
                  style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content List */}
      {loading ? (
        <ActivityIndicator color={brandColors.purple} size="large" className="py-20" />
      ) : content.length === 0 ? (
        <View className="py-20 items-center">
          <Text variant="body-lg" className="text-muted-foreground text-center">
            Inget innehåll hittades i denna kategori.
          </Text>
        </View>
      ) : (
        <View className="gap-y-6">
          {content.map((item) => (
            <ImageCard
              key={item.id}
              variant="horizontal"
              title={item.title}
              description={item.excerpt}
              image={item.featured_image}
              emoji={categories.find(c => c.id === activeCategory)?.emoji}
              emojiBgColor={categories.find(c => c.id === activeCategory)?.color + '20'}
              onPress={() => navigation.navigate('ContentDetail', { id: item.id })}
            />
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
};
