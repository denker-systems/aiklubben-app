/**
 * Icon asset registration.
 *
 * When you add a PNG to assets/icons/, uncomment the corresponding line below.
 * The registerIcon() call links the icon name to the actual image file.
 *
 * Import this file once in App.tsx to register all icons at startup.
 */
import { registerIcon } from '@/components/ui/AppIcon';

export function registerAllIcons() {
  // Navigation / Tabs
  registerIcon('home', require('../../assets/icons/home.png'));
  registerIcon('news', require('../../assets/icons/news.png'));
  registerIcon('courses', require('../../assets/icons/courses.png'));
  registerIcon('courses-example', require('../../assets/icons/courses-example.png'));
  // registerIcon('content', require('../../assets/icons/content.png'));
  registerIcon('profile', require('../../assets/icons/profile.png'));

  // Menu & Actions
  // registerIcon('settings', require('../../assets/icons/settings.png'));
  // registerIcon('support', require('../../assets/icons/support.png'));
  // registerIcon('privacy', require('../../assets/icons/privacy.png'));
  // registerIcon('about', require('../../assets/icons/about.png'));
  // registerIcon('logout', require('../../assets/icons/logout.png'));

  // Stats
  registerIcon('xp', require('../../assets/icons/xp.png'));
  registerIcon('streak', require('../../assets/icons/streak.png'));

  // Course Levels
  // registerIcon('beginner', require('../../assets/icons/beginner.png'));
  // registerIcon('intermediate', require('../../assets/icons/intermediate.png'));
  // registerIcon('advanced', require('../../assets/icons/advanced.png'));

  // Daily goal
  registerIcon('goal', require('../../assets/icons/goal.png'));

  // Content Categories
  // registerIcon('resources', require('../../assets/icons/resources.png'));
  // registerIcon('platforms', require('../../assets/icons/platforms.png'));
  // registerIcon('events', require('../../assets/icons/events.png'));
}
