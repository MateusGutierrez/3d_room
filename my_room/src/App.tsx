import { BackgroundMusic } from './components/backgroundMusicButton';
import { Provider } from './provider/Provider';
import Room from './scenes';

export default function App() {
  return (
    <Provider>
      <BackgroundMusic />
      <Room />
    </Provider>
  );
}
