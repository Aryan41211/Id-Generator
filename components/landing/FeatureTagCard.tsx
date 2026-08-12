export default function FeatureTagCard() {
  const features = [
    "Instantly recognizable HH Goa 2026 identity",
    "1-click download + 1-click Share to X",
    "Works on any photo — no manual cropping",
    "Personalized: name, stack",
    "Bring your whole crew into one combined frame",
    "Seconds from upload to shareable output"
  ]

  return (
    <div className="bg-hh-cream border border-hh-cream-line rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
      <div className="inline-block bg-hh-green-deep text-hh-cream px-4 py-2 rounded-full text-sm font-mono-label uppercase mb-6">
        🌴 Builder ID
      </div>
      
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-hh-ink font-body text-lg">
            <span className="text-hh-pink font-bold mt-1">✦</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}