'use client'

import Image from 'next/image'
import { useState } from 'react'

type Product = { id: number; name: string; price: number; stock: number; imageUrl: string; specs: unknown; category: { name: string } }
type Purpose = 'gaming' | 'creator' | 'office'
type SpecMap = Record<string, string>

const categoryOrder = ['Processor', 'Motherboard', 'RAM', 'VGA', 'Storage', 'Power']
const categoryGuidance: Record<string, string> = {
  Processor: 'Otak komputer yang menjalankan aplikasi dan game.',
  Motherboard: 'Papan utama yang menentukan kecocokan komponen.',
  RAM: 'Memori kerja sementara agar aplikasi berjalan lancar.',
  VGA: 'Komponen yang menghasilkan gambar dan performa gaming.',
  Storage: 'Tempat sistem operasi, aplikasi, dan file disimpan.',
  Power: 'Memberi daya stabil ke seluruh komponen komputer.',
}
const purposeOptions: Record<Purpose, { label: string; description: string; recommended: string }> = {
  gaming: { label: 'Gaming', description: 'Game kompetitif sampai AAA dengan frame rate stabil.', recommended: 'Prioritas GPU dan pendinginan yang cukup.' },
  creator: { label: 'Kreator', description: 'Editing video, desain, 3D, dan multitasking berat.', recommended: 'Prioritas CPU, RAM, dan storage cepat.' },
  office: { label: 'Kerja harian', description: 'Office, belajar, browsing, dan aplikasi produktivitas.', recommended: 'Build seimbang, hemat, dan mudah di-upgrade.' },
}
const budgetOptions = [15000000, 25000000, 40000000]

const getSpecs = (product: Product | undefined): SpecMap => product?.specs && typeof product.specs === 'object' ? product.specs as SpecMap : {}
const numberFromSpec = (value: string | undefined) => Number(value?.match(/\d+/)?.[0] ?? 0)
const money = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

export default function BuildConfigurator({ products }: { products: Product[]; categories: string[] }) {
  const [purpose, setPurpose] = useState<Purpose>('gaming')
  const [budget, setBudget] = useState(25000000)
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [activeStep, setActiveStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const selectedProducts = categoryOrder.map((category) => products.find((product) => product.category.name === category && product.id === selections[category])).filter((product): product is Product => Boolean(product))
  const selectedByCategory = Object.fromEntries(selectedProducts.map((product) => [product.category.name, product]))
  const total = selectedProducts.reduce((sum, product) => sum + product.price, 0)

  const compatibilityMessage = (product: Product) => {
    const specs = getSpecs(product)
    const cpu = getSpecs(selectedByCategory.Processor)
    const motherboard = getSpecs(selectedByCategory.Motherboard)
    if (product.category.name === 'Motherboard' && cpu.Socket && specs.Socket && cpu.Socket !== specs.Socket) return `Tidak cocok: socket CPU ${cpu.Socket}`
    if (product.category.name === 'RAM' && motherboard.Memory && specs.Type && motherboard.Memory !== specs.Type) return `Tidak cocok: motherboard memakai ${motherboard.Memory}`
    if (product.category.name === 'RAM' && motherboard.Socket === 'AM4' && specs.Type === 'DDR5') return 'Tidak cocok: platform AM4 memakai DDR4'
    if (product.category.name === 'Power' && selectedByCategory.VGA) {
      const requiredWatts = numberFromSpec(getSpecs(selectedByCategory.VGA).TDP) + numberFromSpec(cpu.Cores) * 15 + 150
      if (numberFromSpec(specs.Wattage) < requiredWatts) return `Daya kurang: rekomendasi minimal ${requiredWatts}W`
    }
    return ''
  }

  const warnings: string[] = []
  if (selectedByCategory.Motherboard && compatibilityMessage(selectedByCategory.Motherboard)) warnings.push('Processor dan motherboard belum cocok. Pilih pasangan dengan socket yang sama.')
  if (selectedByCategory.RAM && compatibilityMessage(selectedByCategory.RAM)) warnings.push('Jenis RAM belum cocok dengan motherboard yang dipilih.')
  if (selectedByCategory.VGA && selectedByCategory.Power && compatibilityMessage(selectedByCategory.Power)) warnings.push('Power supply terlalu kecil untuk kombinasi ini.')
  if (total > budget) warnings.push(`Build melewati budget ${money(budget)}. Coba pilih komponen dengan harga lebih rendah.`)
  if (!selectedByCategory.Processor) warnings.push('Mulai dari processor agar pilihan motherboard dan RAM bisa dibantu sistem.')

  const recommendedProduct = (category: string) => products.filter((product) => product.category.name === category && product.stock > 0).sort((a, b) => {
    if (purpose === 'gaming' && category === 'VGA') return b.price - a.price
    if (purpose === 'office') return a.price - b.price
    return Math.abs(budget / 6 - a.price) - Math.abs(budget / 6 - b.price)
  })[0]

  const chooseRecommendation = () => {
    const next = { ...selections }
    for (const category of categoryOrder) {
      const recommendation = recommendedProduct(category)
      if (recommendation) next[category] = recommendation.id
    }
    setSelections(next)
    setSaved(false)
  }

  const isComplete = selectedProducts.length === categoryOrder.length && warnings.length === 0
  const activeCategory = categoryOrder[activeStep]
  const activeOptions = products.filter((product) => product.category.name === activeCategory)
  const activeProduct = selectedByCategory[activeCategory]
  const selectProduct = (productId: number) => {
    setSelections({ ...selections, [activeCategory]: productId })
    setSaved(false)
  }
  const goToStep = (step: number) => setActiveStep(Math.max(0, Math.min(categoryOrder.length - 1, step)))
  const addBuildToCart = () => {
    selectedProducts.forEach((product) => window.dispatchEvent(new CustomEvent('gila:add-to-cart', { detail: { id: String(product.id), name: product.name, category: product.category.name, price: product.price } })))
  }

  return <div className="builder-workspace">
    <section className="builder-guide"><div className="builder-guide-heading"><div><p className="eyebrow">01 / Mulai dari kebutuhan</p><h2>Jangan pusing<br /><em>pilih arahnya.</em></h2></div><p>Belum paham komponen? Tidak apa-apa. Pilih tujuanmu, lalu kami bantu menyusun titik awal yang masuk akal.</p></div><div className="purpose-grid">{Object.entries(purposeOptions).map(([value, option]) => <button key={value} className={purpose === value ? 'purpose-card is-active' : 'purpose-card'} onClick={() => { setPurpose(value as Purpose); setSaved(false) }}><span>{option.label}</span><small>{option.description}</small><em>{option.recommended}</em></button>)}</div><div className="budget-row"><div><p className="eyebrow">Batas budget komponen</p><strong>{money(budget)}</strong></div><div className="budget-buttons">{budgetOptions.map((option) => <button key={option} className={budget === option ? 'is-active' : ''} onClick={() => { setBudget(option); setSaved(false) }}>{money(option)}</button>)}</div></div><button className="button button-dark recommendation-button" onClick={chooseRecommendation}>Buat rekomendasi awal <span>↗</span></button></section>
    <div className="builder-layout">
      <div className="builder-options"><div className="builder-progress"><span>02 / Susun komponen</span><strong>{selectedProducts.length} dari {categoryOrder.length} dipilih</strong></div><div className="builder-step-list" aria-label="Langkah perakitan">{categoryOrder.map((category, index) => <button type="button" key={category} className={activeStep === index ? 'is-active' : ''} onClick={() => goToStep(index)}><span>{String(index + 1).padStart(2, '0')}</span><b>{category}</b><small>{selections[category] ? 'Dipilih' : 'Belum dipilih'}</small></button>)}</div><div className="builder-session"><div className="builder-session-heading"><div><p className="eyebrow">Sesi {activeStep + 1} dari {categoryOrder.length}</p><h3>Pilih {activeCategory}</h3><p>{categoryGuidance[activeCategory]}</p></div><strong>{activeProduct ? '1 dipilih' : 'Belum dipilih'}</strong></div><div className="builder-product-grid">{activeOptions.map((product) => { const incompatibility = compatibilityMessage(product); const isSelected = selections[activeCategory] === product.id; return <button type="button" className={isSelected ? 'builder-product-card is-selected' : 'builder-product-card'} key={product.id} disabled={product.stock === 0 || Boolean(incompatibility)} onClick={() => selectProduct(product.id)}><div className="builder-product-image">{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} width={180} height={110} /> : <span>{activeCategory.slice(0, 1)}</span>}</div><strong>{product.name}</strong><small>{product.stock === 0 ? 'Habis' : incompatibility || money(product.price)}</small></button> })}</div><select value={selections[activeCategory] ?? ''} onChange={(event) => selectProduct(Number(event.target.value))}><option value="">Pilih {activeCategory} dari daftar</option>{activeOptions.map((product) => { const incompatibility = compatibilityMessage(product); return <option key={product.id} value={product.id} disabled={product.stock === 0 || Boolean(incompatibility)}>{product.name} {product.stock === 0 ? '(habis)' : incompatibility ? `(${incompatibility})` : ''}</option> })}</select>{activeProduct && <small className="builder-help">{activeCategory === 'Processor' ? `Socket ${getSpecs(activeProduct).Socket ?? 'belum tercatat'} menentukan motherboard yang cocok.` : activeCategory === 'Power' ? 'Sisakan ruang daya agar PC stabil saat beban tinggi.' : activeCategory === 'RAM' ? `Tipe ${getSpecs(activeProduct).Type ?? 'RAM'} harus sama dengan dukungan motherboard.` : 'Pilihan ini masuk ke ringkasan build.'}</small>}<div className="builder-session-navigation"><button type="button" className="button button-outline" disabled={activeStep === 0} onClick={() => goToStep(activeStep - 1)}>← Sebelumnya</button><button type="button" className="button button-dark" disabled={!activeProduct || activeStep === categoryOrder.length - 1} onClick={() => goToStep(activeStep + 1)}>{activeStep === categoryOrder.length - 1 ? 'Selesai' : 'Berikutnya'} <span>→</span></button></div></div></div>
      <aside className="builder-summary"><p className="eyebrow">03 / Pemeriksaan build</p><h2>Rakit yang<br /><em>punya arah.</em></h2><div className={warnings.length ? 'builder-alerts has-warning' : 'builder-alerts'}>{warnings.length ? warnings.map((warning) => <p key={warning}>! {warning}</p>) : <p>✓ Komponen utama terlihat serasi. Lengkapi semua bagian untuk melanjutkan.</p>}</div><div className="summary-items">{selectedProducts.length ? selectedProducts.map((product) => <div key={product.id}><span>{product.category.name}<small>{product.name}</small></span><strong>{money(product.price)}</strong></div>) : <p className="summary-empty">Pilih rekomendasi atau komponen untuk melihat estimasi.</p>}</div><div className="summary-total"><span>Estimasi total</span><strong>{money(total)}</strong></div><div className="builder-actions"><button className="button button-outline" disabled={!selectedProducts.length} onClick={() => { localStorage.setItem('gila-komputer-build', JSON.stringify({ purpose, budget, selections })); setSaved(true) }}>{saved ? 'Build tersimpan' : 'Simpan build'} <span>↗</span></button><button className="button button-dark" disabled={!isComplete} onClick={addBuildToCart}>Masukkan ke keranjang <span>＋</span></button></div></aside>
    </div>
  </div>
}
