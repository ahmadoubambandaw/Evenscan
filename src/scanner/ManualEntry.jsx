import { useState } from 'react';

export default function ManualEntry({ onSubmit }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (!code) return;
    onSubmit(code);
    setValue('');
  }

  return (
    <form className="manual-entry" onSubmit={handleSubmit}>
      <input
        className="manual-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ex: TK-2026-001-ABCD"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button type="submit">Vérifier</button>
    </form>
  );
}
