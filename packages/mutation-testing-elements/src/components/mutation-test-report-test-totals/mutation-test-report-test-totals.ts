import { LitElement, html, property, customElement, unsafeCSS } from 'lit-element';
import { bootstrap } from '../../style';
import { pathJoin } from '../../lib/codeHelpers';
import { MetricsResult, TestMetrics, TestFileModel } from 'mutation-testing-metrics';
import { toAbsoluteUrl } from '../../lib/htmlHelpers';
import { SvgService } from '../svg';
import style from './index.scss';

@customElement('mutation-test-report-test-totals')
export class MutationTestReportTotalsTestComponent extends LitElement {
  @property()
  public model: MetricsResult<TestFileModel, TestMetrics> | undefined;

  @property()
  public currentPath: string[] = [];

  private readonly svgService = new SvgService();

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    if (this.model) {
      return html`
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link" href="#">👽 Mutants</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="#">🧪 Tests</a>
          </li>
        </ul>
        <table class="table table-sm table-hover table-bordered table-no-top">${this.renderHead()} ${this.renderTableBody(this.model)}</table>
      `;
    } else {
      return undefined;
    }
  }

  private renderHead() {
    return html`<thead>
      <tr>
        <th colspan="2">
          <div><span>File / Directory</span></div>
        </th>
        <th class="rotate text-center" style="width: 70px">
          <div><span># Without coverage</span></div>
        </th>
        <th class="rotate text-center" style="width: 70px">
          <div><span># Pacifist</span></div>
        </th>
        <th class="rotate text-center" style="width: 70px">
          <div><span># Total</span></div>
        </th>
      </tr>
    </thead>`;
  }

  private renderTableBody(model: MetricsResult<TestFileModel, TestMetrics>) {
    const renderChildren = () => {
      if (model.file) {
        return undefined;
      } else {
        return model.childResults.map((childResult) => {
          let fullName: string = childResult.name;
          while (!childResult.file && childResult.childResults.length === 1) {
            childResult = childResult.childResults[0];
            fullName = pathJoin(fullName, childResult.name);
          }
          return this.renderRow(fullName, childResult, pathJoin(...this.currentPath, fullName));
        });
      }
    };
    return html`<tbody>${this.renderRow(model.name, model, undefined)} ${renderChildren()}</tbody>`;
  }

  private renderRow(name: string, row: MetricsResult<TestFileModel, TestMetrics>, path: string | undefined) {
    return html`<tr title="${row.name}">
      <td style="width: 32px;" class="icon no-border-right"
        >${row.file ? this.svgService.getIconForFile(row.name) : this.svgService.getIconForFolder()}</td
      >
      <td width="" class="no-border-left"
        >${typeof path === 'string' ? html`<a href="${toAbsoluteUrl(path)}">${name}</a>` : html`<span>${row.name}</span>`}</td
      >
      <td class="text-center">${row.metrics.withoutCoverage}</td>
      <td class="text-center">${row.metrics.pacifist}</td>
      <td class="text-center">${row.metrics.total}</td>
    </tr>`;
  }
}
