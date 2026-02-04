import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '@/components/layout';
import { Text, ImageCard } from '@/components/ui';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useMenu } from '@/contexts/MenuContext';
import { Menu } from 'lucide-react-native';

export const NewsScreen = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const menuContext = useMenu();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*, news_categories(name, emoji, slug)')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setNews(data || []);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: sv });
    } catch {
      return 'Okänt datum';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color={brandColors.purple} />
      </View>
    );
  }

  return (
    <ScreenWrapper 
      title="Nyheter" 
      headerRight={
        <TouchableOpacity onPress={() => menuContext?.openMenu()}>
          <Menu size={24} color={brandColors.purple} />
        </TouchableOpacity>
      }
    >
      {news.length === 0 ? (
        <Text className="text-muted-foreground text-center py-10">Inga nyheter hittades.</Text>
      ) : (
        <View className="gap-y-6 pt-4">
          {news.map((article) => (
            <ImageCard
              key={article.id}
              title={article.title}
              subtitle={article.news_categories?.name}
              description={article.summary}
              image={article.image_url}
              emoji={article.news_categories?.emoji}
              date={article.published_at ? formatDate(article.published_at) : 'Opublicerad'}
              onPress={() => navigation.navigate('NewsDetail', { id: article.id })}
            />
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
};
