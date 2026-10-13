import { iconSearch } from '../assets';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <label className="search-bar">
      <input value={value} onChange={onChange} placeholder={placeholder} />
      <img src={iconSearch} alt="" />
    </label>
  );
}
