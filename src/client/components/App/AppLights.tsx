const DEFAULT_LIGHT_COUNT = 50;

type AppLightsProps = {
  count?: number;
}

export function AppLights({ count }: AppLightsProps) {
  const lightCount = count ?? DEFAULT_LIGHT_COUNT;
  return (
    <div className="app-lights">
      <ul className="lights">
        {Array.from({ length: lightCount }).map((_, idx) =>
          <li className="light" id={`light-${idx+1}`}></li>
        )}
      </ul>
    </div>
  )
}
