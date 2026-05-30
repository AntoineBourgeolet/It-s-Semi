import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FCFAEF] p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl cartoon-border shadow-[8px_8px_0_#2D3436]">
        <h1 className="text-3xl font-black mb-6 text-[#2D3436]">Règles de confidentialité</h1>
        <div className="space-y-4 text-gray-700">
          <p>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
          <h2 className="text-xl font-bold text-[#2D3436]">1. Collecte des données</h2>
          <p>
            It's Semi est une application qui fonctionne principalement localement sur votre appareil. Les données concernant votre jardin (vos cultures sélectionnées, etc.) sont stockées localement dans votre navigateur via le LocalStorage.
          </p>
          <h2 className="text-xl font-bold text-[#2D3436]">2. Utilisation des données</h2>
          <p>
            Les données stockées localement ne sont utilisées que pour vous fournir les fonctionnalités de l'application (afficher votre jardin, calculer les dates de semis et de récolte). Nous ne vendons, ni ne louons vos données à des tiers.
          </p>
          <h2 className="text-xl font-bold text-[#2D3436]">3. Accès à la localisation</h2>
          <p>
            L'application peut demander l'accès à votre localisation approximative (ou la saisie de votre ville) afin de déterminer votre zone climatique et d'adapter le calendrier de culture. Ces informations de localisation ne sont pas conservées sur nos serveurs.
          </p>
          <h2 className="text-xl font-bold text-[#2D3436]">4. Nous contacter</h2>
          <p>
            Si vous avez des questions concernant cette politique de confidentialité, n'hésitez pas à nous contacter à l'adresse suivante : <a href="mailto:its.semi.app@gmail.com" className="font-bold underline text-[#2D3436]">its.semi.app@gmail.com</a>.
          </p>
        </div>
        <div className="mt-8">
          <a href={import.meta.env.BASE_URL} className="inline-block px-6 py-3 bg-[#FFD93D] rounded-xl font-bold text-[#2D3436] border-4 border-[#2D3436] shadow-[4px_4px_0_#2D3436] hover:translate-y-1 hover:shadow-none transition-all">
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
