import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '@/components/layout';
import { Text, Button, ImageCard } from '@/components/ui';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('content_categories')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <ScreenWrapper noPadding>
      {/* Hero Section */}
      <View className="py-12 px-6">
        <View className="bg-background-100 p-8 rounded-[32px] border border-primary/10 shadow-xl">
          <Text variant="h1" className="mb-4">
            <Text variant="h1" style={{ color: brandColors.pink }}>Välkommen</Text>
            <Text variant="h1"> till ai klubben! 🚀</Text>
          </Text>

          <View className="mb-8">
            <Text variant="h3" className="mb-4">
              Vår vision för en AI-driven framtid
            </Text>
            <Text variant="body-lg" className="text-muted-foreground">
              AI Klubben tror starkt på att artificiell intelligens (AI) inte bara är för experter, utan ett verktyg som alla kan använda för att förbättra sina liv och samhället.
            </Text>
          </View>

          <Button 
            variant="secondary"
            size="lg"
            onPress={() => navigation.navigate('Profile')}
            style={{ alignSelf: 'flex-start' }}
          >
            Min profil
          </Button>
        </View>
      </View>

      {/* Catalogue Section */}
      <View className="bg-background-50 py-12 px-6">
        <View className="mb-10">
          <Text variant="h2" style={{ color: brandColors.pink }} className="mb-2">
            Innehåll
          </Text>
          <Text variant="body-lg" className="text-muted-foreground">
            Utforska vårt innehåll och resurser för att lära dig mer om AI
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={brandColors.purple} size="large" />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {categories.map((cat) => (
              <ImageCard 
                key={cat.id}
                title={cat.name} 
                emoji={cat.icon || '📚'} 
                emojiBgColor={cat.color ? `${cat.color}20` : undefined}
                description={cat.description || ''}
                onPress={() => navigation.navigate('Content', { category: cat.slug })}
                style={{ width: '48%', marginBottom: 16 }}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};
