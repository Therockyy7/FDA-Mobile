import Reactotron from "reactotron-react-native";
import { reactotronRedux } from "reactotron-redux";

const reactotron = Reactotron.configure({
  name: "FDA-Mobile", // Tên app hiển thị trên Reactotron desktop
})
  .useReactNative({
    networking: {
      // Theo dõi tất cả API calls (axios, fetch)
      ignoreUrls: /symbolicate/,
    },
    errors: { veto: () => false }, // Hiển thị tất cả errors
    storybook: false,
  })
  .use(reactotronRedux()) // Plugin theo dõi Redux state
  .connect();

// Cho phép dùng console.tron.log() để log trực tiếp lên Reactotron
declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}
console.tron = Reactotron;

export default reactotron;
