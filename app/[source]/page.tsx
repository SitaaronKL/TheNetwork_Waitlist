import { Home } from '../page';

export default function SourcePage({ params }: { params: { source: string } }) {
  return <Home source={params.source} />;
}

