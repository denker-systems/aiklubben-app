import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';

interface AuthorBadgeProps {
  name: string;
  role?: string;
  avatar?: string;
}

export function AuthorBadge({ name, role, avatar }: AuthorBadgeProps) {
  return (
    <View style={styles.container}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholderAvatar}>
          <Text variant="tiny" weight="bold" style={styles.avatarInitial}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text variant="body-sm" weight="bold" style={styles.name}>
          {name}
        </Text>
        {role && (
          <Text variant="tiny" style={styles.role}>
            {role}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  placeholderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1D1933',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  avatarInitial: {
    color: '#8B5CF6',
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    color: '#F9FAFB',
  },
  role: {
    color: '#9CA3AF',
  },
});
