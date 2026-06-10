import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import HSLSlider from '../components/HSLSlider';
import HSLSliderGroup from '../components/HSLSliderGroup';
import ColorSwatch from '../components/ColorSwatch';

describe('HSLSlider', () => {
  const defaultProps = {
    label: 'Hue',
    value: 180,
    min: 0,
    max: 360,
    unit: '°',
    trackColor: 'red',
    onChange: () => {},
  };

  it('renders label, track, thumb, and value', () => {
    render(<HSLSlider {...defaultProps} />);
    expect(screen.getByText('Hue')).toBeInTheDocument();
    expect(screen.getByText('180°')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('fires onChange on ArrowUp key', () => {
    const fn = vi.fn();
    render(<HSLSlider {...defaultProps} onChange={fn} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(fn).toHaveBeenCalledWith(181);
  });

  it('fires onChange on ArrowDown key', () => {
    const fn = vi.fn();
    render(<HSLSlider {...defaultProps} onChange={fn} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(fn).toHaveBeenCalledWith(179);
  });

  it('clamps value at min', () => {
    const fn = vi.fn();
    render(<HSLSlider {...defaultProps} value={0} onChange={fn} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' });
    expect(fn).toHaveBeenCalledWith(0);
  });

  it('clamps value at max', () => {
    const fn = vi.fn();
    render(<HSLSlider {...defaultProps} value={360} onChange={fn} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
    expect(fn).toHaveBeenCalledWith(360);
  });
});

describe('HSLSliderGroup', () => {
  it('renders three sliders', () => {
    render(<HSLSliderGroup h={180} s={50} l={50} onChange={() => {}} />);
    expect(screen.getByText('Hue')).toBeInTheDocument();
    expect(screen.getByText('Saturation')).toBeInTheDocument();
    expect(screen.getByText('Lightness')).toBeInTheDocument();
  });

  it('calls onChange with updated value', () => {
    const fn = vi.fn();
    render(<HSLSliderGroup h={180} s={50} l={50} onChange={fn} />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.keyDown(sliders[0], { key: 'ArrowUp' });
    expect(fn).toHaveBeenCalledWith({ h: 181, s: 50, l: 50 });
  });
});

describe('ColorSwatch', () => {
  it('renders with correct HSL background', () => {
    const { container } = render(<ColorSwatch h={200} s={60} l={40} />);
    const div = container.firstChild;
    expect(div).toHaveStyle('background-color: hsl(200, 60%, 40%)');
  });

  it('accepts custom size', () => {
    const { container } = render(<ColorSwatch h={0} s={0} l={0} size={120} />);
    const div = container.firstChild;
    expect(div).toHaveStyle('width: 120px');
  });
});
