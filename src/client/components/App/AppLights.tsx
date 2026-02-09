const DEFAULT_LIGHT_COUNT = 50;

type AppLightsProps = {
  readonly count?: number;
}

export function AppLights({ count }: AppLightsProps) {
  const lightCount = count ?? DEFAULT_LIGHT_COUNT;
  return (
    <div className="app-lights">
      <ul className="lights">
        {Array.from({ length: lightCount }).map((_, idx) => {
          const key = `light-${idx + 1}`;
          return <li className="light" key={key} id={key}></li>;
        })}
      </ul>
    </div>
  )
}
