const manufacturers = [
  { name: 'NVIDIA', type: 'Graphics' },
  { name: 'AMD', type: 'Processor / Graphics' },
  { name: 'INTEL', type: 'Processor' },
  { name: 'ASUS', type: 'Hardware' },
  { name: 'MSI', type: 'Hardware' },
  { name: 'CORSAIR', type: 'Memory / Power' },
  { name: 'KINGSTON', type: 'Memory / Storage' },
  { name: 'GIGABYTE', type: 'Hardware' },
]

export default function ManufacturerBrands() {
  return <section className="manufacturer-section page-width" aria-label="Brand produsen komponen yang tersedia">
    <div className="manufacturer-heading"><p className="eyebrow">Built with trusted names</p><span>Komponen dari ekosistem yang kami percaya.</span></div>
    <div className="manufacturer-grid">{manufacturers.map((manufacturer) => <div className="manufacturer-logo" key={manufacturer.name}><strong>{manufacturer.name}</strong><small>{manufacturer.type}</small></div>)}</div>
  </section>
}
