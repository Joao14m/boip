/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const AgreGreen = {
  brand:       '#52B788', // medium-light green — primary
  button:      '#40916C', // CTA buttons
  dark:        '#2D6A4F', // titles, deep accents
  header:      '#B7E4C7', // top section background
  pale:        '#EAF5ED', // very light tint
  inputBg:     '#F0FAF3', // input field background
  inputBorder: '#C4DEC9', // input border
  muted:       '#5A7A65', // secondary text
  placeholder: '#9DBFAB', // placeholder text
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = {
  regular:   'Inter-Regular',
  semiBold:  'Inter-SemiBold',
  bold:      'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
};
