import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import Markdown from 'react-native-markdown-display';
import { ScreenWrapper } from '@/components/layout';
import { Text, NewsTitle, AuthorBadge } from '@/components/ui';

export const NewsDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*, news_categories(name, emoji), profiles(name, role, avatar_url)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color={brandColors.purple} />
      </View>
    );
  }

  if (!article) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center p-6">
        <Text variant="body-lg">Artikeln kunde inte hittas.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text style={{ color: brandColors.purple }}>Gå tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getProcessedContent = () => {
    if (!article.content) return '';
    const titleLine = `# ${article.title}`;
    if (article.content.trim().startsWith(titleLine)) {
      return article.content.trim().replace(titleLine, '').trim();
    }
    return article.content;
  };

  return (
    <ScreenWrapper noPadding showBack>
      <View className="relative h-80">
        {article.image_url ? (
          <Image source={{ uri: article.image_url }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-background-50 items-center justify-center">
            <Text style={{ fontSize: 60 }}>{article.news_categories?.emoji || '📰'}</Text>
          </View>
        )}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ top: Math.max(insets.top, 20), left: 20 }}
          className="absolute w-12 h-12 rounded-full bg-black/40 items-center justify-center backdrop-blur-md border border-white/10"
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="px-6 py-8">
        <NewsTitle 
          title={article.title}
          category={article.news_categories?.name}
          emoji={article.news_categories?.emoji}
        />

        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <Calendar size={16} color="#9CA3AF" />
            <Text variant="body-sm" className="text-muted-foreground ml-2">
              {article.published_at ? format(new Date(article.published_at), 'd MMMM yyyy', { locale: sv }) : 'Opublicerad'}
            </Text>
          </View>
          {article.profiles && (
            <AuthorBadge 
              name={article.profiles.name} 
              role={article.profiles.role} 
              avatar={article.profiles.avatar_url} 
            />
          )}
        </View>

        {article.summary && (
          <View className="bg-background-50 p-6 rounded-3xl border-l-4 border-primary mb-10 shadow-sm">
            <Text variant="body-lg" style={{ fontStyle: 'italic', lineHeight: 28 }}>
              {article.summary}
            </Text>
          </View>
        )}

        <Markdown
          style={{
            body: { color: '#F9FAFB', fontSize: 17, lineHeight: 26 },
            heading1: { color: '#F9FAFB', fontSize: 28, fontWeight: 'bold', marginTop: 32, marginBottom: 16 },
            heading2: { color: '#F9FAFB', fontSize: 22, fontWeight: 'bold', marginTop: 28, marginBottom: 12 },
            heading3: { color: '#F9FAFB', fontSize: 19, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
            paragraph: { marginBottom: 20 },
            bullet_list: { marginBottom: 20 },
            ordered_list: { marginBottom: 20 },
            list_item: { color: '#F9FAFB', fontSize: 17, lineHeight: 26, marginBottom: 10 },
            strong: { fontWeight: 'bold', color: '#FFFFFF' },
            em: { fontStyle: 'italic' },
            blockquote: { 
              backgroundColor: '#1D1933', 
              borderLeftColor: brandColors.purple, 
              borderLeftWidth: 4,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginVertical: 20,
              borderRadius: 8
            }
          }}
        >
          {getProcessedContent()}
        </Markdown>
      </View>
      <View style={{ height: insets.bottom + 100 }} />
    </ScreenWrapper>
  );
};
