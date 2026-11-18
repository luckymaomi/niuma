import { exchangeList, type ExchangeProgress } from "../../core/exchange";
import { formatPercent } from "../../core/earn";

function exchangeRowHtml(row: ExchangeProgress): string {
  const width = `${(row.progress * 100).toFixed(2)}%`;
  const countText = `当前 ${row.ratio.toFixed(2)} ${row.item.unit}`;
  const nextText = `下一${row.item.unit} ${formatPercent(row.progress)}`;

  return `
    <div class="exchange-item" data-exchange-id="${row.item.id}">
      <div class="exchange-top">
        <div class="exchange-name">${row.item.name}</div>
        <div class="exchange-price mono">¥ ${row.item.price.toFixed(row.item.price % 1 ? 1 : 0)}</div>
      </div>
      <div class="exchange-meta">
        <span class="exchange-count" data-role="count">${countText}</span>
        <span class="exchange-next mono" data-role="next">${nextText}</span>
      </div>
      <div class="exchange-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(row.progress * 100)}">
        <div class="exchange-fill" data-role="fill" style="width: ${width}">
          <span class="exchange-sheen"></span>
        </div>
      </div>
    </div>
  `;
}

export function exchangePanelHtml(earned: number): string {
  const rows = exchangeList(earned).map(exchangeRowHtml).join("");
  return `
    <section class="panel exchange-panel">
      <h2 class="section-title">今天能换</h2>
      <div class="exchange-grid" id="exchangeGrid">
        ${rows}
      </div>
    </section>
  `;
}
