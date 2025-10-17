export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-center mb-12">Tarifs</h1>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card text-center">
            <h3 className="text-2xl font-bold mb-4">Gratuit</h3>
            <p className="text-4xl font-bold mb-6">0 CHF</p>
            <ul className="text-left space-y-2 mb-6">
              <li>✓ Accès à 50 cas</li>
              <li>✓ Catégories de base</li>
            </ul>
            <button className="btn-secondary w-full">Commencer</button>
          </div>
          <div className="card text-center border-2 border-blue-600">
            <h3 className="text-2xl font-bold mb-4">Premium</h3>
            <p className="text-4xl font-bold mb-6">29 CHF<span className="text-sm">/mois</span></p>
            <ul className="text-left space-y-2 mb-6">
              <li>✓ Accès à tous les cas</li>
              <li>✓ Toutes les catégories</li>
              <li>✓ Suivi de progression</li>
            </ul>
            <button className="btn-primary w-full">S'abonner</button>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-4xl font-bold mb-6">49 CHF<span className="text-sm">/mois</span></p>
            <ul className="text-left space-y-2 mb-6">
              <li>✓ Tout Premium</li>
              <li>✓ Génération de cas IA</li>
              <li>✓ Support prioritaire</li>
            </ul>
            <button className="btn-primary w-full">S'abonner</button>
          </div>
        </div>
      </div>
    </div>
  );
}
