export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  News: undefined;
  Courses: undefined;
  Content: undefined;
  Profile: undefined;
  NewsDetail: { id: string };
  ContentDetail: { id: string };
  CourseDetail: { id: string };
  Lesson: { lessonId: string; courseId: string };
  Settings: undefined;
  Support: undefined;
  Privacy: undefined;
  About: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
