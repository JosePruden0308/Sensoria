import { formatMoney } from '../config.js'

export default function Payments({ payments, isBackend, onRefresh }) {
  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="payments-header-actions">
        <span className="muted small">
          {isBackend ? 'Mostrando pedidos reales sincronizados desde el backend.' : 'Mostrando pedidos locales (localStorage).'}
        </span>
        {onRefresh && (
          <button className="link-btn" onClick={onRefresh} style={{ textDecoration: 'underline' }}>
            Actualizar lista
          </button>
        )}
      </div>

      <div className="payments-summary card">
        <div>
          <span className="muted">Pagos registrados</span>
          <strong>{payments.length}</strong>
        </div>
        <div>
          <span className="muted">Total recaudado</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </div>

      {payments.length === 0 ? (
        <p className="muted">Aún no hay pagos registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Artículos</th>
              <th className="right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {payments
              .slice()
              .reverse()
              .map((p) => (
                <tr key={p.id || p.reference}>
                  <td>{new Date(p.date || p.createdAt).toLocaleString()}</td>
                  <td>
                    {p.customer}
                    {p.email ? <div className="muted small">{p.email}</div> : null}
                    {p.reference ? <div className="muted small font-mono">{p.reference}</div> : null}
                  </td>
                  <td>
                    <span className="badge">{p.method}</span>
                  </td>
                  <td>
                    <span className={`badge status-${(p.status || 'APPROVED').toLowerCase()}`}>
                      {p.status || 'APPROVED'}
                    </span>
                  </td>
                  <td>
                    {(p.items || []).map((i, idx) => (
                      <div key={i.id || idx} className="small">
                        {i.qty}× {i.name}
                      </div>
                    ))}
                  </td>
                  <td className="right">{formatMoney(p.amount)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
