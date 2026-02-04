export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  News: undefined;
  Content: undefined;
  Profile: undefined;
  Settings: undefined;
  NewsDetail: { id: string };
  ContentDetail: { id: string };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
