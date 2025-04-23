import { useProgress } from "@react-three/drei";

interface Props {
  started: any;
  onStarted: any
}

export const LoadingScreen = ({ started, onStarted }: Props) => {
  return (
    <div className={`loadingScreen ${started ? "loadingScreen--started" : ""}`}>
      <div className="loadingScreen__board">
        <h1 className="loadingScreen__title">Welcome to Mateus Maia Gutierrez</h1>
        <button
          className="loadingScreen__button"
          onClick={onStarted}
        >
          Start
        </button>
      </div>
    </div>
  );
};