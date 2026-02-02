interface Props {
  started: boolean;
  onStarted: () => void;
}

export const LoadingScreen = ({ started, onStarted }: Props) => {
  return (
    <div className={`loadingScreen ${started ? 'loadingScreen--started' : ''}`}>
      <div className="loadingScreen__board">
        <div className="typewriter">
          <h1>Welcome to my Portfolio!</h1>
        </div>
        <p className="loadingScreen__subtitle">Explore my interactive 3D workspace</p>
        <button className="loadingScreen__button" onClick={onStarted}>
          Enter
        </button>
      </div>
    </div>
  );
};
