import Link from 'next/link'
import Image from 'next/image'

type Product = { id: number; name: string; slug: string; description: string; price: number; imageUrl: string; category: { name: string } }

export default function ProductCard({ product }: { product: Product }) {
	const addToCart = () => window.dispatchEvent(new CustomEvent('gila:add-to-cart', { detail: { id: String(product.id), name: product.name, category: product.category.name, price: product.price } }))

	return (
		<div className="product-card group">
			<div className="product-card-image">
				{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} width={640} height={480} /> : <span>{product.category.name.slice(0, 1)}</span>}
			</div>
			<Link href={`/products/${product.slug}`} className="product-card-copy"><p className="eyebrow">{product.category.name}</p><h2>{product.name}</h2><p className="product-description">{product.description}</p><strong>Rp {product.price.toLocaleString('id-ID')}</strong></Link>
			<button className="product-add" onClick={addToCart}>Tambah <span>＋</span></button>
		</div>
	)
}
