export default function Home() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontSize:'48px',fontWeight:900,color:'#1B2E4B'}}>
          Linka<span style={{color:'#4AADE8'}}>Style</span>
        </h1>
        <p style={{color:'#6B7A90',marginTop:'8px',fontSize:'18px'}}>
          Încălțăminte pentru copii de brand european
        </p>
        <div style={{marginTop:'32px',display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/admin" style={{background:'#4AADE8',color:'white',padding:'14px 28px',borderRadius:'12px',fontWeight:700,fontSize:'16px',textDecoration:'none'}}>
            Panou Admin →
          </a>
        </div>
        <p style={{marginTop:'24px',color:'#999',fontSize:'13px'}}>
          Site în construcție — în curând produsele vor fi disponibile
        </p>
      </div>
    </div>
  )
}
