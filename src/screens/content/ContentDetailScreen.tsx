import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/config/supabase';
import { brandColors } from '@/config/theme';
import { ArrowLeft } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { MotiView } from 'moti';
import { SPRING_CONFIGS } from '@/lib/animations';

export const ContentDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setContent(data);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color={brandColors.purple} />
      </View>
    );
  }

  if (!content) {
    return (
      <View className="flex-1 bg-background-0 items-center justify-center p-6">
        <Text className="text-foreground text-xl">Innehållet kunde inte hittas.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-primary">Gå tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter out the first H1 if it's identical to the title to avoid double rendering
  const getProcessedContent = () => {
    if (!content.content) return '';
    const titleLine = `# ${content.title}`;
    if (content.content.trim().startsWith(titleLine)) {
      return content.content.trim().replace(titleLine, '').trim();
    }
    return content.content;
  };

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative h-80">
          {content.featured_image ? (
            <Image source={{ uri: content.featured_image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-background-50 items-center justify-center">
              <Text className="text-primary font-bold text-lg uppercase tracking-widest">{content.category}</Text>
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

        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={SPRING_CONFIGS.smooth}
          className="px-6 py-8"
        >
          <View className="bg-primary/10 self-start px-4 py-1 rounded-full border border-primary/20 mb-4">
            <Text className="text-primary font-bold uppercase tracking-widest text-xs">
              {content.category}
            </Text>
          </View>

          <Text className="text-foreground text-4xl font-bold leading-tight mb-6">
            {content.title}
          </Text>

          {content.excerpt && (
            <View className="bg-background-50 p-6 rounded-3xl border-l-4 border-primary mb-10 shadow-sm">
              <Text className="text-foreground text-lg italic leading-relaxed">
                {content.excerpt}
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
        </MotiView>
        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
};
