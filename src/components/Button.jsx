export default function Button({ children, className = '', variant = 'solid', ...props }) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition'
  const styles = {
    solid: 'bg-sf-primary text-white hover:bg-sf-primary-600',
    outline: 'border border-sf-border text-sf-foreground hover:bg-sf-primary/10'
  }
  return (
    <button {...props} className={base + ' ' + styles[variant] + ' ' + className}>
      {children}
    </button>
  )
}
