interface Props {
  started: any;
  onStarted: any
}

export const LoadingScreen = ({ started, onStarted }: Props) => {
  return (
    <div className={`loadingScreen ${started ? "loadingScreen--started" : ""}`}>
      <div className="loadingScreen__board">
        <div className="typewriter">
          <h1>Welcome to my Portfolio!</h1>
        </div>
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