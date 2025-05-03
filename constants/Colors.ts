import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme,
  type Theme,
} from "@react-navigation/native";

export interface MyTheme extends Theme {
  colors: Theme["colors"] & {
    secondary: string;
    surface: string;
    surfaceLight: string;
    tabBarInactive: string;
  };
}

const DarkTheme: MyTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: "#4ADE80",
    secondary: "#2DD4BF",
    background: "#181818",
    text: "#F5E7D2",
    surface: "#1A1A1A",
    surfaceLight: "#7B7B7B",
    tabBarInactive: "rgba(170, 248, 199, 0.15)",
  },
};

const LightTheme: MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#23BA5B",
    secondary: "#2DD4BF",
    background: "rgb(242, 242, 242)",
    surface: "rgb(182, 178, 178)",
    surfaceLight: "#9FA3AF",
    tabBarInactive: "rgba(170, 248, 199, 0.15)",
  },
};

export { DarkTheme, LightTheme };
