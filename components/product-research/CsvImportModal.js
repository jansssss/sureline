'use client';
/**
 * CSV 가져오기
 * 파일 선택 → 서버 미리보기 → 컬럼 매핑·오류 확인 → 정상 행만 등록 / 전체 취소
 */
import { useState } from 'react';
import { Modal, Button, Badge, T } from './ui';
import { CSV_COLUMNS, CSV_REQUIRED } from '@/lib/product-research/constants.js';

export default function CsvImportModal({ open, onClose, onImported, authFetch }) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => {
    setCsvText(''); setFileName(''); setPreview(null); setError(''); setResult(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = async (file) => {
    if (!file) return;
    setError(''); setResult(null); setPreview(null);
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
    await runPreview(text);
  };

  const runPreview = async (text) => {
    setBusy(true);
    try {
      const res = await authFetch('/api/admin/product-research/import', {
        method: 'POST',
        body: JSON.stringify({ csv: text, commit: false }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '미리보기에 실패했습니다.'); setPreview(data.preview ?? null); }
      else setPreview(data.preview);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCommit = async () => {
    if (!preview) return;
    const rowNumbers = preview.rows.filter((r) => r.valid).map((r) => r.rowNumber);
    if (rowNumbers.length === 0) return;
    setBusy(true);
    try {
      const res = await authFetch('/api/admin/product-research/import', {
        method: 'POST',
        body: JSON.stringify({ csv: csvText, commit: true, rowNumbers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '등록에 실패했습니다.'); return; }
      setResult(data);
      onImported();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = () => {
    const header = `﻿${CSV_COLUMNS.join(',')}\r\n`;
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-research-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="CSV 가져오기"
      subtitle="정상 행만 등록하거나, 전체를 취소할 수 있습니다."
      width={960}
      footer={
        <>
          <Button onClick={downloadTemplate} style={{ marginRight: 'auto' }}>템플릿 다운로드</Button>
          <Button onClick={handleClose} disabled={busy}>전체 취소</Button>
          <Button
            variant="primary"
            onClick={handleCommit}
            disabled={busy || !preview || preview.validCount === 0 || Boolean(result)}
          >
            {busy ? '처리 중…' : `정상 행만 등록${preview ? ` (${preview.validCount}건)` : ''}`}
          </Button>
        </>
      }
    >
      <div style={{
        border: `1.5px dashed ${T.primaryBorder}`, borderRadius: 12, padding: 18,
        textAlign: 'center', marginBottom: 14, background: '#fbfcff',
      }}>
        <input
          id="pr-csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
        <label htmlFor="pr-csv-file" style={{
          display: 'inline-block', padding: '8px 18px', fontSize: 13, fontWeight: 700,
          background: T.primary, color: '#fff', borderRadius: 8, cursor: 'pointer',
        }}>
          CSV 파일 선택
        </label>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>
          {fileName ? `선택된 파일: ${fileName}` : `필수 컬럼: ${CSV_REQUIRED.join(', ')}`}
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '10px 12px', marginBottom: 14, fontSize: 12.5, color: '#b91c1c', fontWeight: 600,
        }}>
          ✕ {error}
        </div>
      )}

      {result && (
        <div style={{
          background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10,
          padding: '10px 12px', marginBottom: 14, fontSize: 12.5, color: '#065f46',
        }}>
          <div style={{ fontWeight: 800 }}>✓ {result.created.length}건 등록 완료</div>
          {result.failed.length > 0 && (
            <ul style={{ margin: '6px 0 0', paddingLeft: 16, color: '#b45309' }}>
              {result.failed.map((f) => (
                <li key={f.rowNumber}>{f.rowNumber}행 {f.product_name}: {f.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <Badge bg="#e0f2fe" fg="#075985" icon="Σ">전체 {preview.rows.length}행</Badge>
            <Badge bg="#d1fae5" fg="#065f46" icon="✓">정상 {preview.validCount}행</Badge>
            <Badge bg="#fee2e2" fg="#b91c1c" icon="✕">오류 {preview.errorCount}행</Badge>
            {preview.unknownHeaders.length > 0 && (
              <Badge bg="#fef3c7" fg={T.warnFg} icon="?">
                무시된 컬럼: {preview.unknownHeaders.join(', ')}
              </Badge>
            )}
          </div>

          <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>
            컬럼 매핑:{' '}
            {preview.headers.map((h, i) => (
              <span key={i} style={{ marginRight: 8 }}>
                <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 4 }}>{h}</code>
                {' → '}
                {preview.mapping[i]
                  ? <strong style={{ color: T.success }}>{preview.mapping[i]}</strong>
                  : <span style={{ color: T.danger }}>무시</span>}
              </span>
            ))}
          </div>

          <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10, maxHeight: 340, overflowY: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12, minWidth: 640 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                <tr>
                  <th style={cell}>행</th>
                  <th style={cell}>상태</th>
                  <th style={cell}>제품명</th>
                  <th style={cell}>대표 키워드</th>
                  <th style={cell}>총검색량</th>
                  <th style={cell}>메시지</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.rowNumber} style={{
                    borderTop: `1px solid ${T.borderSoft}`,
                    background: r.valid ? (r.duplicate ? '#fffbeb' : '#fff') : '#fef2f2',
                  }}>
                    <td style={cell}>{r.rowNumber}</td>
                    <td style={cell}>
                      {r.valid
                        ? (r.duplicate
                            ? <Badge bg="#fef3c7" fg={T.warnFg} icon="!">중복 주의</Badge>
                            : <Badge bg="#d1fae5" fg="#065f46" icon="✓">정상</Badge>)
                        : <Badge bg="#fee2e2" fg="#b91c1c" icon="✕">오류</Badge>}
                    </td>
                    <td style={cell}>{r.data.product_name ?? '-'}</td>
                    <td style={cell}>{r.data.primary_keyword ?? '-'}</td>
                    <td style={cell}>
                      {r.data.total_monthly_search === null || r.data.total_monthly_search === undefined
                        ? '미입력'
                        : Number(r.data.total_monthly_search).toLocaleString('ko-KR')}
                    </td>
                    <td style={{ ...cell, color: r.errors.length ? '#b91c1c' : T.warnFg }}>
                      {[...r.errors, ...r.warnings].map((m, i) => (
                        <div key={i}>{m.column}: {m.message}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}

const cell = { padding: '7px 9px', textAlign: 'left', verticalAlign: 'top', whiteSpace: 'nowrap' };
