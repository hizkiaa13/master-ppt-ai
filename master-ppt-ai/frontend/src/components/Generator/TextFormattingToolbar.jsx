import React from 'react';

function TextFormattingToolbar({ selectedElement, onUpdate, onClose }) {
  if (!selectedElement) return null;

  const fontFamilies = [
    'Montserrat',
    'Open Sans',
    'Poppins',
    'Lato',
    'Playfair Display',
    'Source Sans Pro',
    'Roboto',
    'Oswald',
    'Raleway',
    'Merriweather',
  ];

  const fontSizes = [
    12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72,
  ];

  const alignments = [
    { value: 'left', tooltip: 'Rata Kiri (Ctrl+L)' },
    { value: 'center', tooltip: 'Rata Tengah (Ctrl+E)' },
    { value: 'right', tooltip: 'Rata Kanan (Ctrl+R)' },
    { value: 'justify', tooltip: 'Justify (Ctrl+J)' },
  ];

  const handleFontChange = (e) => {
    onUpdate({
      ...selectedElement,
      font: e.target.value,
    });
  };

  const handleSizeChange = (e) => {
    onUpdate({
      ...selectedElement,
      fontSize: parseInt(e.target.value, 10),
    });
  };

  const handleBoldToggle = () => {
    onUpdate({
      ...selectedElement,
      isBold: !selectedElement.isBold,
    });
  };

  const handleItalicToggle = () => {
    onUpdate({
      ...selectedElement,
      isItalic: !selectedElement.isItalic,
    });
  };

  const handleUnderlineToggle = () => {
    onUpdate({
      ...selectedElement,
      isUnderline: !selectedElement.isUnderline,
    });
  };

  const handleAlignChange = (alignment) => {
    onUpdate({
      ...selectedElement,
      align: alignment,
    });
  };

  const handleColorChange = (e) => {
    onUpdate({
      ...selectedElement,
      color: e.target.value,
    });
  };

  const handleLineHeightChange = (e) => {
    onUpdate({
      ...selectedElement,
      lineHeight: parseFloat(e.target.value),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-lg text-gray-900 transition-all animate-slide-down">
      <div className="flex items-center gap-3 md:gap-4 flex-wrap">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title="Tutup Toolbar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200" />

        {/* Font Family */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-semibold">Font</label>
          <select
            value={selectedElement.font || 'Montserrat'}
            onChange={handleFontChange}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs md:text-sm font-medium bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
            style={{ fontFamily: selectedElement.font || 'Montserrat' }}
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200" />

        {/* Font Size */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-semibold">Ukuran</label>
          <select
            value={selectedElement.fontSize || 24}
            onChange={handleSizeChange}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs md:text-sm font-medium bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20 shadow-sm cursor-pointer"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}pt
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200" />

        {/* Text Style Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBoldToggle}
            className={`p-1.5 md:p-2 rounded-lg transition-all ${
              selectedElement.isBold
                ? 'bg-blue-100 text-blue-600 font-bold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Bold (Ctrl+B)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 6a1 1 0 011-1h3a3 3 0 010 6H9a1 1 0 01-1-1V6zM8 11a1 1 0 011-1h3a3 3 0 010 6H9a1 1 0 01-1-1v-4z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleItalicToggle}
            className={`p-1.5 md:p-2 rounded-lg transition-all ${
              selectedElement.isItalic
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Italic (Ctrl+I)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v1.323l3.954-1.582A1 1 0 1115.69 4.495L11.243 6.277V10h2.507a1 1 0 110 2H11.243v3.723l4.447 1.782a1 1 0 11-.736 1.852L11 17.677V19a1 1 0 11-2 0v-1.323l-3.954 1.582a1 1 0 11-.736-1.852L8.757 15.66V12H6.25a1 1 0 010-2h2.507V6.277l-4.447-1.782a1 1 0 01.736-1.852L9 4.323V3a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleUnderlineToggle}
            className={`p-1.5 md:p-2 rounded-lg transition-all ${
              selectedElement.isUnderline
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Underline (Ctrl+U)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 4a3 3 0 016 0v6a3 3 0 01-6 0V4zm6 10a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200" />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-600 font-semibold mr-1 hidden sm:inline">Posisi</label>
          {alignments.map((align) => (
            <button
              key={align.value}
              type="button"
              onClick={() => handleAlignChange(align.value)}
              className={`p-1.5 md:p-2 rounded-lg transition-all ${
                (selectedElement.align || 'left') === align.value
                  ? 'bg-blue-100 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={align.tooltip}
            >
              {align.value === 'left' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {align.value === 'center' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {align.value === 'right' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {align.value === 'justify' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200" />

        {/* Text Color */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-semibold">Warna</label>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg p-1 shadow-sm">
            <input
              type="color"
              value={selectedElement.color || '#000000'}
              onChange={handleColorChange}
              className="w-7 h-7 rounded border border-gray-300 cursor-pointer bg-transparent p-0"
              title="Pilih Warna Text"
            />
            <input
              type="text"
              value={selectedElement.color || '#000000'}
              onChange={handleColorChange}
              className="w-20 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono text-gray-800"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-gray-200" />

        {/* Line Height */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600 font-semibold">Line</label>
          <select
            value={selectedElement.lineHeight || 1.5}
            onChange={handleLineHeightChange}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs md:text-sm font-medium bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-20 shadow-sm cursor-pointer"
          >
            <option value="1">1.0</option>
            <option value="1.2">1.2</option>
            <option value="1.5">1.5</option>
            <option value="1.8">1.8</option>
            <option value="2">2.0</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default TextFormattingToolbar;
