export default function HowItWorksStrip() {
  const steps = [
    {
      number: "01",
      title: "UPLOAD",
      description: "drop your photo, or your whole crew's"
    },
    {
      number: "02",
      title: "PERSONALIZE",
      description: "name, stack, and we'll assign your class"
    },
    {
      number: "03",
      title: "GENERATE",
      description: "composited instantly, no loading screen"
    },
    {
      number: "04",
      title: "SHARE",
      description: "download or post straight to X"
    }
  ]

  return (
    <section className="bg-hh-green-mid py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="font-mono-label text-hh-yellow text-4xl md:text-5xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="font-display text-hh-cream text-2xl uppercase mb-2">
                {step.title}
              </h3>
              <p className="font-body text-hh-cream/60 text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}