import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { brandColors } from '@/config/theme';
import { supabase } from '@/config/supabase';
import { ScreenWrapper } from '@/components/layout';
import { Text, Card, Badge } from '@/components/ui';
import { LogOut, Award, BookOpen, CheckCircle, GraduationCap, User as UserIcon, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!statsError && statsData) {
          setStats({
            totalSaved: statsData.saved_count || 0,
            totalRead: statsData.read_count || 0,
            completedCourses: statsData.completed_courses_count || 0,
            points: statsData.total_points || 0,
          });
        } else {
          setStats({
            totalSaved: 0,
            totalRead: 0,
            completedCourses: 0,
            points: 0,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

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

  const roleEmoji = profile?.role === 'admin' ? '👑' : '🌟';

  return (
    <ScreenWrapper noPadding>
      {/* Header with Background Effect */}
      <View className="relative h-64 overflow-hidden bg-background-50">
        <View 
          className="absolute inset-0" 
          style={{ backgroundColor: brandColors.darkPurple, opacity: 0.3 }}
        />
        <View className="absolute -bottom-16 self-center">
          <View className="w-32 h-32 rounded-full border-4 border-background-0 bg-background-100 items-center justify-center shadow-xl shadow-black/40">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} className="w-full h-full rounded-full" />
            ) : (
              <Text variant="h1" style={{ color: brandColors.purple, fontSize: 48 }}>
                {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className="px-6 pt-20 items-center">
        <View className="items-center">
          <View className="flex-row items-center">
            <Text variant="h2" className="mr-2">{profile?.name || 'Användare'}</Text>
            <Text className="text-2xl">{roleEmoji}</Text>
          </View>
          <Text variant="body-lg" className="text-muted-foreground mt-1">{user?.email}</Text>
          
          <View className="flex-row mt-4 gap-x-3">
            <Badge 
              label={`Medlem sedan ${formatDate(profile?.created_at || new Date().toISOString())}`}
              variant="outline"
            />
            <Badge 
              label={profile?.role === 'admin' ? 'Admin' : 'Medlem'}
              variant="primary"
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View className="w-full flex-row flex-wrap justify-between mt-10">
          <StatCard 
            title="Sparade" 
            value={stats?.totalSaved || 0} 
            icon={BookOpen} 
            color="#3B82F6" 
          />
          <StatCard 
            title="Lästa" 
            value={stats?.totalRead || 0} 
            icon={CheckCircle} 
            color="#10B981" 
          />
          <StatCard 
            title="Kurser" 
            value={stats?.completedCourses || 0} 
            icon={GraduationCap} 
            color="#F59E0B" 
          />
          <StatCard 
            title="Poäng" 
            value={stats?.points || 0} 
            icon={Award} 
            color="#8B5CF6" 
          />
        </View>

        {/* Actions */}
        <View className="w-full mt-10 gap-y-4">
          <Card 
            variant="default"
            onPress={() => {}}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center mr-4">
              <UserIcon size={20} color={brandColors.purple} />
            </View>
            <View className="flex-1">
              <Text variant="body-lg" weight="bold">Redigera Profil</Text>
              <Text variant="body-sm" className="text-muted-foreground">Ändra namn och inställningar</Text>
            </View>
            <ChevronRight size={20} color="#4B5563" />
          </Card>

          <Card 
            variant="outline"
            onPress={() => signOut()}
            style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <View className="w-10 h-10 rounded-2xl bg-error/10 items-center justify-center mr-4">
              <LogOut size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text variant="body-lg" weight="bold" style={{ color: '#EF4444' }}>Logga ut</Text>
              <Text variant="body-sm" style={{ color: 'rgba(239, 68, 68, 0.6)' }}>Avsluta din session</Text>
            </View>
          </Card>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card 
    variant="elevated"
    style={{ width: '48%', marginBottom: 16 }}
  >
    <View className="flex-row items-center mb-3">
      <View 
        className="w-8 h-8 rounded-xl items-center justify-center"
        style={{ backgroundColor: color + '20' }}
      >
        <Icon size={16} color={color} />
      </View>
      <Text variant="tiny" weight="bold" className="text-muted-foreground ml-2 uppercase tracking-widest">{title}</Text>
    </View>
    <Text variant="h2">{value}</Text>
  </Card>
);
