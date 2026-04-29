type NavbarProps = {
  center?: string;
};

export default function Navbar({ center = 'Categories.LIVE' }: NavbarProps) {
  return (
    <nav className='navbar navbar-expand-lg bg-light border-bottom border-black mb-3'>
      <div className='container-fluid justify-content-center'>
        <span className='navbar-brand mb-0 h1'>{center}</span>
      </div>
    </nav>
  );
}
