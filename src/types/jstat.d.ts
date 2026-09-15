declare module "jstat" {
  const jStat: {
    studentt: {
      cdf(x: number, df: number): number;
      pdf(x: number, df: number): number;
    };
    centralF: {
      cdf(x: number, df1: number, df2: number): number;
      pdf(x: number, df1: number, df2: number): number;
    };
    chisquare: {
      cdf(x: number, df: number): number;
      pdf(x: number, df: number): number;
    };
    normal: {
      cdf(x: number, mean: number, std: number): number;
      pdf(x: number, mean: number, std: number): number;
    };
  };
  export default jStat;
}
