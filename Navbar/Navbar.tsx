import styles from './Navbar.module.scss';

export const Navbar = () => {
  return (
    <header className={styles.headerWrapper}>
      <div className={styles.headerContainer}>
        <div className={styles.leftContainer}>
          <a className={styles.title} href="https://t.me/LaExplorad0ra" target='_blank'>LaExploradora.</a>
        </div>

        <div className={styles.rightContainer}>
          <a className={styles.item} href="">About</a>
          <a className={styles.item} href="">Contact</a>
          <a className={styles.item} href="https://www.linkedin.com/in/dmitry-nikulin-5992571ba/" target='__blank'>LinkedIn</a>
        </div>

      </div>
    </header>
  )
}