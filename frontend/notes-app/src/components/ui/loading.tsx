import { Grid } from 'ldrs/react'
import 'ldrs/react/Grid.css'

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="grid gap-4 place-items-center">
        <Grid
          size="60"
          speed="1.5"
          color="#137fec" 
        />
      </div>
    </div>
  );
}
export default LoadingSpinner;